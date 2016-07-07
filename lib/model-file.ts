import * as fs from 'fs-extra';
import * as path from 'path';
import * as def from  './def';
import {Utils as $}  from  './utils';
import * as yaml from "js-yaml";


const YAML_EXT: string = '.yaml';
const JSON_EXT: string = '.json';

export const SUPPORT_EXT: string[] = [JSON_EXT, YAML_EXT];

export class ModelFile {
  public static read(file: string):any {
    let ext = path.extname(file);
    if (JSON_EXT === ext) {
      return $.readJSONWithComments(file);
    } if (YAML_EXT === ext) {
      return yaml.safeLoad(fs.readFileSync(file, 'utf8'));
    }
    else {
      throw Error(`Not support '${ext}'`);
    }
  }

  public static findFile(fileWithoutExt: string): string | boolean   {
    if (fs.existsSync(fileWithoutExt + JSON_EXT)) return fileWithoutExt + JSON_EXT;
    else if (fs.existsSync(fileWithoutExt + YAML_EXT)) return fileWithoutExt + YAML_EXT;
    else return false;
  }

}
