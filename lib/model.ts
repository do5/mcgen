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
  private modelsNative: { [id: string]: def.ModelInfo } = {};

  //All types in all files
  private types: ModelTypes = {};

  public getModels(): { [id: string]: def.ModelInfo } {
    return this.modelsNative;
  }

  constructor(private basedir: string) {
    super();
  }

  /*
  * <firstnamespace><relpath>
  */
  private getModelNamespace(file: string, firstnamespace: string = ''): string {
    if ($.isEmptyString(firstnamespace)) {
      firstnamespace = path.basename(this.basedir)
    }
    let modelPath = this.getModelPath(file);
    if ($.isEmptyString(modelPath)) {
      return `${firstnamespace}`;

    } else {
      return `${firstnamespace}/${this.getModelPath(file)}`;
    }
  }

  /*
  * <filename.withoutext>
  */
  private getModelFilename(file: string): string {
    let ext = path.extname(file);

    let result = path.basename(file).replace(ext, '');
    return result;
  }

  /*
  * <relpath>.<filename.withoutext>
  */
  private getModelId(file: string): string {
    let ext = path.extname(file);
    let result = path.relative(this.basedir, file).replace(ext, '').replace(/\\/g, '/');
    return result;
  }

  /*
  * <relpath>
  */
  private getModelPath(file: string): string {
    let ext = path.extname(file);
    let result = path.relative(this.basedir, path.dirname(file)).replace(ext, '').replace(/\\/g, '/');
    return result;
  }

  public getPathOut(modelInfo: def.ModelInfo, destdir: string, info: def.InfoTemplate): string {
    let result = path.relative(this.basedir, modelInfo.$src);
    result = result.replace(path.extname(result), '');
    if (!$.isEmptyString(info.addname)) result += '-' + info.addname;
    result = path.join(destdir, result + info.ext);
    return result;
  }

  private static chechDublication(mt: ModelTypes, name: string, mInfo: def.ModelInfo) {
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
        mInfo.$namespace = this.getModelNamespace(files[n]);
        mInfo.$path = this.getModelPath(files[n]);
        mInfo.$filename = this.getModelFilename(files[n]);

        this.modelsNative[this.getModelId(files[n])] = mInfo;
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
    let check = (typeName: string, oblig: boolean, model: def.ModelInfo) => {
      if ($.isEmptyString(typeName)) {
        if (oblig) this.error(`Empty type`, model.$src);
        return;
      }
      if (this.isSimpleType(typeName)) return;  //ok
      let t = this.types[typeName];
      if (_.isUndefined(t)) {
        this.error(`Not found type '${typeName}'`, model.$src);
        return;
      }
      //const type should't be 'type' in model.
      if (t.nativeType === 'consts') {
        this.error(`Const type '${typeName}' should't be type in other`, model.$src);
        return;
      }
      return; //ok
    }

    for (var key in this.modelsNative) {
      let imp_cur: def.ModelInfo = this.modelsNative[key];

      //Model check
      _.each(imp_cur.models, (model) => {
        let prop = {};
        check(model.basetype, false, imp_cur);
        _.each(model.items, (item) => {
          if (_.isObject(prop[item.name])) this.error(`Properties duplication '${item.name}' in '${item.type}'`, imp_cur.$src);
          prop[item.name] = {};
          check(item.type, true, imp_cur)
        });
      });
      if (this.isError()) return;

      //Contract test
      _.each(imp_cur.contracts, (contract) => {
        check(contract.basetype, false, imp_cur);
        _.each(contract.methods, (method) => {
          if (_.isObject(method.result)) check(method.result.type, true, imp_cur);
          _.each(method.args, (arg) => check(arg.type, true, imp_cur));
        });
      });
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
