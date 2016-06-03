import * as fs from 'fs-extra';
import * as path from 'path';
import {Setting} from './setting';
import {Template} from './template';
import {InfoTemplate} from './def';
import * as json_comments from 'strip-json-comments';
import * as _ from 'underscore';

export class Utils {

  public static isEmptyString(inp: string): boolean {
    return ((inp === "") || (inp === undefined) || (inp === null))
  }

  public static relpath(file: string): string {
    if (!Utils.isEmptyString(file) && path.isAbsolute(file)) {
      file = path.relative(Setting.__root, file);
    }
    return file;
  }

  public static consoleProccessCompil(action: string, file: string) {
    if (Setting.mp_console)
      console.log(`${action} complete. ${path.relative(Setting.mp_outdir, file)}`);
  }

  public static consoleProccess(msg: string) {
    if (Setting.mp_console)
      console.log(msg);
  }

  public static consoleError(msg: string) {
    if (Setting.mp_console)
      console.error(msg);
  }

  public static readAbsDir(dir: string): string[] {
    let result: string[] = [];
    if (Utils.isEmptyString(dir)) return result;

    fs.readdirSync(dir).forEach(e => {
      e = path.join(dir, e);
      if (fs.statSync(e).isDirectory()) result.push(e);
    });

    return result;
  }

  public static readAbsFiles(dir: string, ext: string[] = []): string[] {
    let result: string[] = [];
    if (Utils.isEmptyString(dir)) return result;

    fs.readdirSync(dir).forEach(e => {
      e = path.join(dir, e);
      if (fs.statSync(e).isFile() && (ext != []) && (_.contains(ext, path.extname(e)))) result.push(e);
    });

    return result;
  }

  public static readAbsFileRec(dirs: string[], filesout: string[], ext: string[] = []): void {
    for (let i = 0; i < dirs.length; i++) {
      let chielddirs = Utils.readAbsDir(dirs[i]);
      if (chielddirs.length != 0) {
        Utils.readAbsFileRec(chielddirs, filesout, ext);
      }

      let files = Utils.readAbsFiles(dirs[i], ext);
      for (let n = 0; n < files.length; n++) {
        filesout.push(files[n]);
      }
    }
  }


  public static readJSONWithComments(file: string) {
    var jsons = fs.readFileSync(file, 'utf8');
    return JSON.parse(json_comments(jsons));
  }
}
