import * as fs from 'fs-extra';
import * as path from 'path';
import * as def from  './def';
import {Utils as $}  from  './utils';
import * as yaml from "js-yaml";


const YAML_EXT: string = '.yaml';
const JSON_EXT: string = '.json';

export const SUPPORT_EXT: string[] = [JSON_EXT, YAML_EXT];

export class ModelFile {
  public static Read(file: string): def.ModelInfo {
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
}
