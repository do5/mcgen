import * as fs from 'fs-extra';
import * as path from 'path';
import {JsonValidator} from './json-validator'
import {Utils as $}  from  './utils';
import * as def from  './def';
import * as _ from  'underscore';
import {ErrorLast} from './error-last';
import {Setting} from './setting';

import {SUPPORT_EXT, ModelFile} from './model-file';

export type NativeType = 'enums' | 'models' | 'consts' | 'contracts';
interface ModelTypes {
  [typename: string]: {
    nativeType: NativeType;
    model: def.ModelInfo
  }
}

export class Model extends ErrorLast {
  private modelsNative: { [path: string]: def.ModelInfo } = {};

  //All types in all files
  private types: ModelTypes = {};

  public getModels(): { [path: string]: def.ModelInfo } {
    return this.modelsNative;
  }

  constructor(private basedir: string) {
    super();
  }

  private normalizeRel(file: string): string {
    let ext = path.extname(file);
    let result = path.relative(this.basedir, file).replace(ext, '').replace('\\', '/');
    return result;
  }

  private static chechDublication(mt: ModelTypes, name:string, mInfo: def.ModelInfo) {
      let t = mt[name];
      if (!_.isUndefined(t)) {
        throw Error(`Duplication type ${name} in the file with the file '${$.relpath(t.model.$src)}' '${$.relpath(mInfo.$src)}' `);
      }
  }

  private filltypes(mInfo: def.ModelInfo) {
    _.each(Model.getModelTypes(mInfo), (val, key) => {
      Model.chechDublication(this.types, key, mInfo);
      this.types[key] = val;
    });
  }

  public static getModelTypes(mInfo: def.ModelInfo): ModelTypes {
    let result: ModelTypes = {};
    let addtype = (name: string, nativeType: NativeType) => {
      Model.chechDublication(result, name, mInfo);
      result[name] = {
        nativeType: nativeType,
        model: mInfo
      };
    };
    _.each(mInfo.consts, (val) => addtype(val.name, 'consts'));
    _.each(mInfo.enums, (val) => addtype(val.name, 'enums'));
    _.each(mInfo.models, (val) => addtype(val.name, 'models'));
    _.each(mInfo.contracts, (val) => addtype(val.name, 'contracts'));
    return result;
  }

  private readModelRec(dirs: string[], validator: JsonValidator): void {
    for (let i = 0; i < dirs.length; i++) {
      let chielddirs = $.readAbsDir(dirs[i]);
      if (chielddirs.length != 0) {
        this.readModelRec(chielddirs, validator);
      }

      let files = $.readAbsFiles(dirs[i], SUPPORT_EXT);
      for (let n = 0; n < files.length; n++) {
        let mInfo: def.ModelInfo;
        try {
          mInfo = ModelFile.Read(files[n]);
        }
        catch (e) {
          this.error(e);
          continue;
        }

        if (!validator.validate(mInfo)) {
          this.error(files[n], validator.getLastDisplayError());
          continue;
        }

        mInfo.$src = files[n];
        this.modelsNative[this.normalizeRel(files[n])] = mInfo;
        try {
          this.filltypes(mInfo);
        } catch (e) {
          this.error(e);
          break;
        }
      }
    }
  }

  /**
   * @param  {string} outdir The directory for the processed templates.
   * @param  {JsonValidator} validator Validator JSONShema
   * @returns boolean
   */
  public proccess(validator: JsonValidator): boolean {
    this.resetError();
    this.readModelRec([this.basedir], validator);
    if (this.isError()) return false;
    this.checkImports();
    if (this.isError()) return false;
    this.checkTypes();
    if (this.isError()) return false;

    return true;
  }

  public getTypes() {
    return this.types;
  }

  static simpleTypes: { [name: string]: string } = null;
  //exteranl call - this destroy used static
  public isSimpleType(typeName: string): boolean {
    if (Model.simpleTypes === null) {
      let jsonShema = Setting.shema_file;
      let shema = fs.readJsonSync(jsonShema);
      if (_.isUndefined(shema.definitions.simpleTypes.enum)) {
        throw Error(`Error in ${jsonShema} path shema.definitions.simpleTypes.enum`);
      }
      Model.simpleTypes = {};
      _.each(shema.definitions.simpleTypes.enum, (val: string) => Model.simpleTypes[val] = val);
    }
    return !_.isUndefined(Model.simpleTypes[typeName]);
  }

  private checkTypes() {
    //search type
    let cursearchType = '';

    let check = (typeName: string): boolean => {
      if ($.isEmptyString(typeName)) return false;
      cursearchType = typeName;
      if (this.isSimpleType(typeName)) return true;
      return !_.isUndefined(this.types[typeName]);
    }

    var iserrres = (istype, model) => {
      if (!istype && !$.isEmptyString(cursearchType)) {
        this.error(`Not found type ${cursearchType}`, model.$src);
        return true
      }
      return false;
    };

    var beginSearch = <T>(check: T[]): boolean => {
      cursearchType = '';
      if (_.isArray(check) && check.length > 0) return true;
      else return false;
    }

    for (var key in this.modelsNative) {
      let imp_cur: def.ModelInfo = this.modelsNative[key];

      //Model test
      if (beginSearch(imp_cur.models)) {
        let istype = _.some(imp_cur.models, (v) => {
          if (check(v.basetype)) return true;
          if (_.isUndefined(v.items) || (v.items.length == 0)) return true;
          return _.some(v.items, (items) => check(items.type));
        });
        if (iserrres(istype, imp_cur)) return;
      }

      //Contract test
      if (beginSearch(imp_cur.contracts)) {
        let istype = _.some(imp_cur.contracts, (v) => {
          if (check(v.basetype)) return true;
          if (_.isUndefined(v.methods) || (v.methods.length == 0)) return true;
          return _.some(v.methods, (method) => {
            if (_.isUndefined(method.args) || (method.args.length == 0)) return true;
            return _.some(method.args, (arg) => check(arg.type));
          });
        });
        if (iserrres(istype, imp_cur)) return;
      }
    }
  }

  private checkImports() {
    for (var key in this.modelsNative) {
      let imp_cur = this.modelsNative[key];
      if (_.isUndefined(imp_cur.imports)) continue;

      for (var i = 0; i < imp_cur.imports.length; i++) {
        var imp_ref = imp_cur.imports[i];
        let model_ref = this.modelsNative[imp_ref.file];
        if (_.isUndefined(model_ref)) {
          this.error(`No search import file ${imp_ref.file}`, `${key}.json`);
          continue;
        }

        if (_.isUndefined(this.types[imp_ref.type])) {
          this.error(`No search type ${imp_ref.type}`, `${key}.json`);
          continue;
        }
      }
    }
  }
}
