
import * as fs from 'fs-extra';
import * as path from 'path';
import * as def from './def';
import {Model} from './model';
import {JsonValidator} from './json-validator'
import {ErrorLast} from './error-last';
import {Utils as $}  from  './utils';
import * as _ from 'underscore';
import {Setting}  from './setting';
import * as Handlebars from 'handlebars';
import {CodeBuider} from './code-builder'
import {HandlebarsContext, HandlebarsAddContext} from './global-handler-hbs';

//Once registor helpers
CodeBuider.regGlobals();

const INFO_FILE: string = "_info.json";
const TRANSFORM_FILE: string = "transform.hbs";
const HBS_JS_FILE: string = "handler.hbs.js";

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

        let context = <HandlebarsContext>model_cur;
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
        _.each(model.getModels(), (minfo, id) => context.namespaces[id] = minfo.$namespace);
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
