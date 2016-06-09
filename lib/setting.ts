import * as path from 'path';
import {Template} from './template';
import {JsonValidator} from './json-validator';
import {Utils as $}  from  './utils';
import * as _ from 'underscore';

export interface Ids {
  [key: string]: {
    [def: string] : any
  };
}

export class Setting {
  //Main parameters
  //Command line section
  //Use template for generate. [] - all
  public static mp_idsTemplate: Ids = {};

  public static mp_templ_user_dir: string = '';
  public static mp_outdir: string = '';
  public static mp_indir: string = '';
  public static mp_console: boolean = true;

  //Path
  public static __root = require('app-root-dir').get();
  public static templ_dir = path.join(__dirname, '..', 'template');
  public static test_items_dir = path.join(__dirname, '..', 'test', 'items');
  public static test_out_dir = path.join(__dirname, '..', 'test', '.temp');
  public static shema_file = path.join(__dirname, '..', 'shemas', 'mcgen-shema.json');


  //--Eval in bootstrap module
  //Add user template
  public static userTemplate: { [key: string]: Template };
  //this templates
  public static integTemplates: { [key: string]: Template };
  //all templates
  public static templates: { [key: string]: Template };
  public static validatorJSON: JsonValidator;
  public static postinit() {
    Setting.userTemplate = Template.createTemplates($.readAbsDir(Setting.mp_templ_user_dir));
    Setting.integTemplates = Template.createTemplates($.readAbsDir(Setting.templ_dir));
    Setting.templates = _.extend(Setting.integTemplates, Setting.userTemplate);

    Setting.validatorJSON = new JsonValidator(Setting.shema_file);
  }
};
