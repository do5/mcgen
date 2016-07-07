
import * as fs from 'fs-extra';
import * as path from 'path';
import * as def from './def';
import {Model, NativeType} from './model';
import {JsonValidator} from './json-validator'
import {ErrorLast} from './error-last';
import {Utils as $}  from  './utils';
import * as _ from 'underscore';
import {Setting}  from './setting';
import * as Handlebars from 'handlebars';
import {CodeBuider} from './code-builder'
import {HandlebarsContext, HandlebarsAddContext} from './global-handler-hbs';
import {ModelConfig} from './model-config'

//Once registor helpers
CodeBuider.regGlobals();

const INFO_FILE: string = "_info.json";
const TRANSFORM_FILE: string = "transform.hbs";
const HBS_JS_FILE: string = "handler.hbs.js";

interface _extype {
  search: boolean;
  type?: string;
  namespace?: string;
}


/**
 * Use https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/dot/dot-tests.ts
 */
export class Template extends ErrorLast {
  public static createTemplates(dirsTemplate: string[]): { [key: string]: Template } {
    let result: { [key: string]: Template } = {};
    dirsTemplate.forEach(e => {
      let val = Template.checkTemplate(e);
      if (val.isOk) {
        result[val.info.id] = new Template(e, val.info);
      }
    });
    return result;
  }

  private static checkTemplate(dirOrFile: string): { isOk: boolean; info: def.InfoTemplate; } {
    let result: { isOk: boolean; info: def.InfoTemplate; } = { isOk: false, info: null };
    dirOrFile = path.join(dirOrFile, INFO_FILE);
    if (!fs.existsSync(dirOrFile)) return result;
    result.info = $.readJSONWithComments(dirOrFile);
    if (result.info.id === undefined) return result;
    result.isOk = true;

    return result;
  }

  public proccess(model: Model, destdir: string): boolean {
    try {
      var regHelpers = CodeBuider.regFromFile(path.join(this.pathTemplate, HBS_JS_FILE));
    } catch (error) {
      this.error(error, path.join(this.pathTemplate, HBS_JS_FILE));
      return false;
    }

    let result = false;
    try {
      this.resetError();
      let addContext: HandlebarsAddContext = { contexts: [] };
      this._proccessEachFile(model, destdir, addContext);
      if (this.isError()) return !this.isError();
      this._proccessAddFile(destdir, addContext);
      return !this.isError();
    } finally {
      CodeBuider.unreg(regHelpers);
    }
  }

  private _proccessAddFile(destdir: string, addContext: HandlebarsAddContext): boolean {
    let files: string[] = [];
    $.readAbsFileRec([this.pathTemplate], files, ['.hbs']);
    for (var i = 0; i < files.length; i++) {
      if (path.basename(files[i]) === TRANSFORM_FILE) continue;

      try {
        let transform = Handlebars.compile(fs.readFileSync(files[i], 'utf8'));
        let result = transform(addContext);
        $.consoleProccessCompil('Compilation', files[i]);
        let outfile = path.relative(this.pathTemplate, files[i]);
        outfile = path.join(destdir, outfile.replace(path.extname(outfile), ''));

        if (!fs.existsSync(path.dirname(outfile))) {
          fs.emptyDirSync(path.dirname(outfile));
        }

        fs.writeFileSync(outfile, result, 'utf8');
      } catch (err) {
        this.error(`Error transform: ${err.message}`, files[i]);
        return false;
      }
    }

    return true;
  }


  private findAndReplaceConfigInfo(type: string, modelSettings: ModelConfig): _extype {
    let result = <_extype>{ search: false };
    let cfg = modelSettings.Config;

    if (!cfg.external) return result;

    let t = _.find(cfg.external, (v) => v.type === type);
    if (!t) return result

    result.search = true;

    let all = t.langs["*"] || {};
    all.type = all.type || type;
    let l = t.langs[this.info.id];

    //First spec setting
    if (l) {
      result.type = l.type;
      result.namespace = l.namespace;
    }

    if (_.isEmpty(result.type)) result.type = all.type;
    if (_.isEmpty(result.namespace)) result.namespace = all.namespace;

    if (_.isUndefined(result.type) || _.isUndefined(result.namespace)) {
      this.error(`The file is incorrectly specified external type '${type}''`, modelSettings.FileName);
    }


    return result;
  }


  private proccessExternalType(context: HandlebarsContext, modelSettings: ModelConfig): HandlebarsContext {
    let ns: { [id: string]: _extype } = {};
    let add_ns = (val: _extype): boolean => {
      if (!val.search) return false;
      ns[`${val.namespace}/+${val.type}`] = val;
      return true;
    }

    let len = (val): number => {
      if (_.isUndefined(val)) return 0;
      if (_.isEmpty(val)) return 0;
      return val.length;
    }

    //typing search and replace type external
    for (let i = 0; i < len(context.models); i++) {
      let items = context.models[i].items;
      for (let n = 0; n < len(items); n++) {
        let val = this.findAndReplaceConfigInfo(items[n].type, modelSettings);
        if (!add_ns(val)) continue;
        items[n].type = val.type;
      }
    }

    for (let i = 0; i < len(context.contracts); i++) {
      let metods = context.contracts[i].methods;
      for (let n = 0; n < len(metods); n++) {
        let val = this.findAndReplaceConfigInfo(metods[n].result.type, modelSettings);
        if (add_ns(val)) {
          metods[n].result.type = val.type;
        }
        for (let z = 0; z < len(metods[n].args); z++) {
          let val = this.findAndReplaceConfigInfo(metods[n].args[z].type, modelSettings);
          if (add_ns(val)) {
            metods[n].args[z].type = val.type;
          }
        }
      }
    }

    _.each(ns, (val) => {
      if (len(context.imports) == 0) context.imports = [];
      context.imports.push({ file: val.namespace, type: val.type });
      context.namespaces[val.namespace] = val.namespace;
    });

    return context;
  }

  private fullClone<T>(val): T {
    return JSON.parse(JSON.stringify(val));
  }

  private _proccessEachFile(model: Model, destdir: string, addContext: HandlebarsAddContext): boolean {
    let file_trans = fs.readFileSync(path.join(this.pathTemplate, TRANSFORM_FILE), 'utf8');

    let transform: HandlebarsTemplateDelegate;
    try {
      transform = Handlebars.compile(file_trans);
    } catch (err) {
      this.error(`Error transform: ${err.message}`, file_trans);
      return false;
    }

    _.each(model.getModels(), (model_cur) => {
      if (this.isError()) return;
      let model_file = model.getPathOut(model_cur, destdir, this.info);

      if (!fs.existsSync(path.dirname(model_file))) {
        fs.emptyDirSync(path.dirname(model_file));
      }

      try {
        let defvars: { [key: string]: string } = {};
        _.each(this.info.vars, (e) => {
          defvars[e.name] = e.value;
        });
        let uservars = Setting.mp_idsTemplate[this.getId()];
        if (!_.isUndefined(uservars)) {
          defvars = _.extend(defvars, uservars);
        }

        let context = this.fullClone<HandlebarsContext>(model_cur)
        context.vars = defvars;
        context.path = model_cur.$path;
        context.filename = model_cur.$filename;
        context.namespace = model_cur.$namespace;
        context.types = {};
        context.namespaces = {};
        context.typesinfile = {};
        context.func = {
          isSimpleType: model.isSimpleType
        };
        _.each(model.getTypes(), (val, key) => {
          context.types[key] = { nativeType: val.nativeType, attrs: val.attrs };
        });
        _.each(Model.getModelTypes(model_cur), (val, key) => context.typesinfile[key] = val.nativeType);
        //namespaces need for parent name folder
        _.each(model.getModels(), (minfo, id) => context.namespaces[id] = minfo.$namespace);

        //replace external types
        context = this.proccessExternalType(context, model.getModelConfig());

        addContext.contexts.push(context);

        let result = transform(context);
        if (!_.isUndefined(this.info.creatematch)) {
          if (result.indexOf(this.info.creatematch) < 0) return;
        }

        $.consoleProccessCompil('Compilation', model_file);
        fs.writeFileSync(model_file, result, 'utf8');
      } catch (err) {
        this.error(`Error transform: ${err.message}`, model_file);
        fs.writeFileSync(model_file, err, 'utf8');
        return;
      }
    });


    return !this.isError();
  }

  /**
   * @param  {string} pathTemplate The path to template transform.
   */
  constructor(private pathTemplate: string, private info: def.InfoTemplate) {
    super();
  }

  public getId(): string {
    return this.info.id;
  }

  public getInfo(): def.InfoTemplate {
    return this.info;
  }

  public getDisplayInfo(): string {
    let res: string[] = [];

    res.push(`'${this.info.id}' ${(this.info.description) ? `${this.info.description}` : ''}`);
    if (this.info.vars.length > 0) {
      res.push(`  args:`);
      this.info.vars.forEach((v) => {
        res.push(`    ${v.name}=${v.value}  ${v.description}`);
      });
    }
    return res.join(require('os').EOL);
  }
}
