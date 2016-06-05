import * as def from './../lib/def';
import * as $ from '../lib/utils';
import * as fs from 'fs-extra';
import * as path from 'path';

export class Tuls {
  public static CheckTextOut(indir: string, outdir: string, infoTemplate: def.InfoTemplate) {
    path.join(indir, '__check', infoTemplate.ext.substr(1));
    if (fs.existsSync(path.join(indir, '__check', infoTemplate.ext.substr(1)))) {

    }
    //if (indir)

  }
}
