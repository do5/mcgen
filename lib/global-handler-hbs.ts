import * as _ from  'underscore';
import * as Handlebars from 'handlebars';
import * as def from './def';
import {NativeType} from './model'

export interface HandlebarsContext extends def.ModelInfo {
  //Vars in file _info.json
  vars: { [key: string]: string };
  //namespace model
  namespace: string;
  //Path rel model
  path: string;
  //filename without ext
  filename: string;
  types: { [key: string]: NativeType };
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


function hb_attrfind(attrs: def.Atts[], val: string) {
  let arrDelim = val.split('.');
  let attr: def.Atts = _.find(attrs, (key) => {
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
export var helpershbs: { [key: string]: Function } = {
  'replace': function (val, to_replace, replacement, cmd) {
    replacement = (replacement || '').replace('\\^', '\\')
    //Handlebars.log(1, "repl - " + _.isString(replacement));
    let res: string = (val || '').replace(to_replace, replacement);
    if (cmd === 'firstupper') {
      let newarr: string[] = [];
      let upper = true;
      for (var i = 0; i < res.length; i++) {
        if (upper) {
          newarr.push(res[i].toUpperCase());
          upper = false;
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

  'regmap': function (name: string, valStr: string, options) {
    let spl = valStr.split(';');
    map[name] = {};
    for (let i = 0; i < spl.length; i++) {
      let t = spl[i].split(':');
      let t_t = t[0].split(',');
      for (let n = 0; n < t_t.length; n++) {
        map[name][t_t[n]] = t[1];
      }
    }
  },

  'map': function (name: string, val: string, options) {
    let spl = map[name][val];
    let context: HandlebarsContext = options.data.root;
    if (_.isUndefined(spl)) {
      if (context.func.isSimpleType(val)) return val;
      let nt = context.types[val]
      if (_.isUndefined(nt)) return val;
      spl = map[name][nt];
      if (_.isUndefined(spl)) return val;
    }
    return spl;
  },

  'ifenum': function (type, options) {
    let context: HandlebarsContext = options.data.root;
    let nt = context.types[type];
    if (_.isUndefined(nt)) options.inverse(this);
    if (nt === 'enums') {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },

  'val': function (name, val: string, options) {
    if (_.isString(name)) {
      return val + name + val;
    }
    return name;
  },

  'attrs-each': function (attrs: def.Atts[], val: string, options) {
    let attr: def.Atts = _.find(attrs, (key) => key.id === val);

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

  'iftype': function (val: any, type: 'array' | 'object' | 'boolean' | 'nimber' | 'string' | 'simle', options) {
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

  'ifattr': function (attrs: def.Atts[], val: string, options) {
    return Handlebars.helpers['if'].call(this, hb_attrfind(attrs, val), options);
  },
  'ifnattr': function (attrs: def.Atts[], val: string, options) {
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
  }
}
