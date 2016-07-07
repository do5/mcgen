import * as def from  './def';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as _ from  'underscore';
import {Setting, Ids} from './setting';
import {ModelFile} from './model-file';
import {ErrorLast} from './error-last';

export const MCGEN_CONFIG_FILE: string = "mcgen-config";

export class ModelConfig {
  /**
 * The settings file must be in the root folder of the model. And called mcgen-config.json
 */
  public Config: def.ConfigInfo;
  public FileName: string;

  public static ReadAndCheckAndFillVars(basedir: string, errorLast: ErrorLast): ModelConfig {
    let result: ModelConfig = new ModelConfig();
    result.Config = <def.ConfigInfo>{};
    let fspath = ModelFile.findFile(path.join(basedir, MCGEN_CONFIG_FILE));
    if (fspath) {
      result.FileName = <string>fspath;
      result.Config = <def.ConfigInfo>ModelFile.read(<string>fspath);
      result.checkSetting(errorLast);
      if (errorLast.isError()) {
        result.Config = <def.ConfigInfo>{};
        return result;
      }
      result.fillVarsSetting();
    }

    return result;
  }

  public isEmpty(): boolean {
    return this.Config == {};
  }


  private fillVarsSetting() {
    if (_.isUndefined(this.Config.vars)) return;
    let defVars = this.Config.vars["*"] || {};

    _.each(Setting.templates, (v) => {
      let cur: { [def: string]: any } = Setting.mp_idsTemplate[v.getId()] || {};

      _.each(defVars, (val, key) => cur[key] = val);
      _.each(this.Config.vars[v.getId()], (val, key) => cur[key] = val);
      if (cur !== {}) Setting.mp_idsTemplate[v.getId()] = cur;
    });
  }

  private checkSetting(errorLast: ErrorLast) {
    /*


         let match = imp_ref.file.match(RegExpCommon.NAME_SPACE);
        if ((match.length == 0) || (match[0] != imp_ref.file)) {
          this.error(`Found invalid characters in imports section '${imp_ref.file}'. Allowed to use  special characters:' ${RegExpCommon.NAME_SPACE_ALLOW}'`, `${key}.json`);
          continue;
        }
        */

  }
}
