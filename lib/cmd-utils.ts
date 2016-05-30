import * as fs from 'fs-extra';
import * as path from 'path';
import {Utils as $}  from  './utils';
import * as def from  './def';
import * as _ from  'underscore';
import {ErrorLast} from './error-last';
import {Setting, Ids}  from './setting';

export class CmdUtils extends ErrorLast {

  public parseids(val: string): Ids {
    let res: Ids = {};
    if (val === '*') return res;
    _.each(val.split(','), (val) => {
      let kv = val.split(':');
      let key = res[kv[0]] = {};
      if (kv.length == 2) {
        _.each(kv[1].split(';'), (val) => {
          let defval = val.split('=');
          key[defval[0].trim()] = defval[1].trim();
        });

      } if (kv.length > 2) {
        this.error(`Error format ${val}`);
        return {};
      }
    });
    return res;

  }

  public templdir(val: string) {
    if (!path.isAbsolute(val))
      val = path.normalize(path.join(Setting.__root, val));
    if (!fs.existsSync(val)) {
      this.error(`path ${val} not exists`);
      return undefined;
    }

    if (!$.readAbsDir(val)) {
      this.error(`path ${val} does not implement the required structure. See ${Setting.templ_dir} structure`);
    }

    return val;
  }

  public indir(val: string) {
    if (!path.isAbsolute(val))
      val = path.normalize(path.join(Setting.__root, val));
    if (!fs.existsSync(val)) {
      this.error(`path ${val} not exists`);
      return undefined;
    }

    return val;
  }

  public emptydir(val: string): string {
    if (!path.isAbsolute(val))
      val = path.normalize(path.join(Setting.__root, val));
    fs.emptyDirSync(val)
    return val;
  }
}
