import * as _ from  'underscore';
import * as Handlebars from 'handlebars';
import * as def from './def';
import {NativeType} from './model'
import {FilePathNonSymbol} from './../lib/model';

export interface HandlebarsContext extends def.ModelInfo {
  //Vars in file _info.json
  vars: { [key: string]: string };
  //namespace model
  namespace: string;
  //Path rel model
  path: string;
  //filename without ext
  filename: string;
  types: {
    [key: string]: {
      nativeType: NativeType,
      attrs: def.Attr[]
    }
  };
  //array namespaces on key imports.file
  namespaces: { [file: string]: string };
  typesinfile: { [key: string]: NativeType };
  func: {
    isSimpleType: (typeName: string) => boolean;
  }
}

export interface HandlebarsAddContext {
  contexts: HandlebarsContext[];
}


function hb_attrfind(attrs: def.Attr[], val: string) {
  let arrDelim = val.split('.');
  let attr: def.Attr = _.find(attrs, (key) => {
    return _.isEqual(key.id, arrDelim[0])
  });
  let condition = !_.isEmpty(attr);
  if (condition && arrDelim.length > 1) {
    condition = attr.hasOwnProperty(arrDelim[1]);
  }
  return condition;
}

var map: {
  [key: string]: {
    [key: string]: string
  }
} = {};

//!!!!! Be sure to use the 'function' as break 'this'
export var helpershbs: { [key: string]: Handlebars.HelperDelegate } = {
  /**
   * To namespace from file path. Check and replace [-,$,#]
   * #create-ns <val> <to_replace> <replacement> [cmd]
   * Example: {{replace 'data/imp/next' '/' '.' 'firstupper'}} -> Data.Imp.Next
   * Example: {{replace 'data/imp/next' '/' '.'}} -> Data.Imp.Next
   */
  'to-ns': function (val, to_replace, replacement, cmd) {
    replacement = (replacement || '').replace(/\\\^/g, '\\')
    let res: string = (val || '').split(to_replace).join(replacement);
    if (cmd === 'firstupper') {
      let newarr: string[] = [];
      let upper = true;
      for (var i = 0; i < res.length; i++) {
        if (upper) {
          newarr.push(res[i].toUpperCase());
          upper = false;
        }
        else if (res[i].match(FilePathNonSymbol)) {
          upper = true;
        }
        else {
          if (res[i] === replacement) upper = true;
          newarr.push(res[i]);
        }
      }
      res = newarr.join('');
    }

    return res;
  },
  /**
   * imports.file to namespace
   */
  'impfileto-ns': function (fileImport: string, options) {
    let context: HandlebarsContext = options.data.root;
    return context.namespaces[fileImport];
  },
  /**
   * regmap <id_map> <param> - It used to reassign values
   * @param  {string} id_map - Id map. The #map used <id_map>.
   * @param  {string} param - format key1[,key2]:value1;key3:value2. if used {{map 'maptype' key1}} displays value1
   */
  'regmap': function (id_map: string, param: string, options) {
    let spl = param.split(';');
    map[id_map] = {};
    for (let i = 0; i < spl.length; i++) {
      let t = spl[i].split(':');
      let t_t = t[0].split(',');
      for (let n = 0; n < t_t.length; n++) {
        map[id_map][t_t[n]] = t[1];
      }
    }
  },

  /**
   * The method is used in a pair regmap
   * @param  {string} id_map  - Id map. The #map used <id_map>.
   * @param  {string} key - see regmap
   */
  'map': function (id_map: string, key: string, options) {
    let spl = map[id_map][key];
    let context: HandlebarsContext = options.data.root;
    if (_.isUndefined(spl)) {
      if (context.func.isSimpleType(key)) return key;
      let ntObj = context.types[key]
      if (_.isUndefined(ntObj)) return key;
      spl = map[id_map][ntObj.nativeType];
      if (_.isUndefined(spl)) return key;
    }
    return spl;
  },
  'ifmodeltype': function (type, nativeType: NativeType, context: HandlebarsContext, options) {
    let ntObj = context.types[type];
    if (_.isUndefined(ntObj)) {
      return options.inverse(this);
    }
    if (ntObj.nativeType === nativeType) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },

  /**
   * depending on the value of string or takes Integer value in val
   * {{val <name> <quotes>} - It is used to output right values
   * @param  {any} name
   * @param  {string} quotes - type quotes '' or "".
  */
  'val': function (name, quotes: string, options) {
    if (_.isString(name)) {
      return quotes + name + quotes;
    }
    return name;
  },

  'attrs-each': function (attrs: def.Attr[], val: string, options) {
    let attr: def.Attr = _.find(attrs, (key) => key.id === val);

    if (_.isEmpty(attr)) {
      return options.inverse(this);
    }

    let arr = [];
    _.each(attr, (val, key) => {
      if (key === "id") return;
      arr.push({ "attr-key": key, "attr-val": val });
    });
    return Handlebars.helpers['each'].call(this, arr, options);
  },

  'iftype': function (val: any, type: 'array' | 'object' | 'boolean' | 'number' | 'string' | 'simple', options) {
    let condition = false;
    switch (type) {
      case 'array':
        condition = _.isArray(val)
        break;
      case 'object':
        condition = _.isObject(val)
        break;
      case 'boolean':
        condition = _.isBoolean(val)
        break;
      case 'number':
        condition = _.isNumber(val)
        break;
      case 'string':
        condition = _.isString(val)
        break;
      case 'simple':
        condition = !(_.isObject(val) || _.isArray(val) || _.isUndefined(val));
        break;
      default:
        condition = false;
        break;
    }
    return Handlebars.helpers['if'].call(this, condition, options);
  },

  'ifattr-type': function (typename: string, attr: string, context: HandlebarsContext, options) {
    let hif = Handlebars.helpers['if'];

    let ntObj = context.types[typename];
    if (_.isUndefined(ntObj)) return hif.call(this, false, options);
    if (_.isUndefined(ntObj.attrs)) return hif.call(this, false, options);

    return hif.call(this, hb_attrfind(ntObj.attrs, attr), options);
  },

  'ifattr': function (attrs: def.Attr[], val: string, options) {
    return Handlebars.helpers['if'].call(this, hb_attrfind(attrs, val), options);
  },
  'ifnattr': function (attrs: def.Attr[], val: string, options) {
    return Handlebars.helpers['if'].call(this, !hb_attrfind(attrs, val), options);
  },
  'lowercase': function (str: string) {
    if (str && typeof str === "string") {
      return str.toLowerCase();
    }
    return '';
  },
  'dump': function (obj) {
    return JSON.stringify(obj, null, '  ');
  },


  /* a helper to execute javascript expressions
  https://gist.github.com/akhoury/9118682
   USAGE:
   -- Yes you NEED to properly escape the string literals or just alternate single and double quotes
   -- to access any global function or property you should use window.functionName() instead of just functionName(), notice how I had to use window.parseInt() instead of parseInt()
   -- this example assumes you passed this context to your handlebars template( {name: 'Sam', age: '20' } )
   <p>Url: {{x " \"hi\" + this.name + \", \" + window.location.href + \" <---- this is your href,\" + " your Age is:" + window.parseInt(this.age, 10) "}}</p>
   OUTPUT:
   <p>Url: hi Sam, http://example.com <---- this is your href, your Age is: 20</p>
  */

  "x": function (expression, options) {
    var fn = function () { }, result;
    try {
      fn = Function.apply(this, ["window", "return " + expression + " ;"]);
    } catch (e) {
      console.warn("{{x " + expression + "}} has invalid javascript", e);
    }

    try {
      result = fn.call(this, window);
    } catch (e) {
      console.warn("{{x " + expression + "}} hit a runtime error", e);
    }
    return result;
  },

  /**
   * To recommend required to use this handler
   */
  'if-required': function (options) {
    //default value
    let condition = true;
    if (!_.isUndefined(this.required)) condition = this.required;
    return Handlebars.helpers['if'].call(this, condition, options);
  },

  'ifn-required': function (options) {
    //default value
    let condition = true;
    if (!_.isUndefined(this.required)) condition = this.required;
    return Handlebars.helpers['if'].call(this, !condition, options);
  }


}
