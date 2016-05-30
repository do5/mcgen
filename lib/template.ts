
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
import {HandlebarsContext} from './global-handler-hbs';

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
      return this._proccess(model, destdir);
    } finally {
      CodeBuider.unreg(regHelpers);
    }
  }

  private _proccess(model: Model, destdir: string): boolean {
    this.resetError();

    let file_trans = fs.readFileSync(path.join(this.pathTemplate, TRANSFORM_FILE), 'utf8');

    let transform: HandlebarsTemplateDelegate;
    try {
      transform = Handlebars.compile(file_trans);
    } catch (err) {
      this.error(`Error transform ${err.message}`, file_trans);
      return false;
    }

    _.each(model.getModels(), (model_cur, path_model) => {
      if (this.isError()) return;
      if (!$.isEmptyString(this.info.addname)) path_model += '-' + this.info.addname;
      let model_file = path.join(destdir, path_model + this.info.ext);
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
        context.path = path_model;
        context.nativeType = {};
        context.func = {
          isSimpleType: model.isSimpleType
        };
        _.each(model.getTypes(), (val, key) => context.nativeType[key] = val.nativeType);

        let result = transform(context);
        if (!_.isUndefined(this.info.creatematch)){
          if (result.indexOf(this.info.creatematch) < 0) return;
        }

        $.consoleProccessCompil('Compilation', model_file);
        fs.writeFileSync(model_file, result, 'utf8');
      } catch (err) {
        this.error(`Error transform ${err.message}`, model_file);
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
