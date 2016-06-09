import * as def from './../lib/def';
import {Utils as $} from '../lib/utils';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as _ from 'underscore';
import {Template} from './../lib/template';
import {Model} from './../lib/model';
import {Setting, Ids}  from './../lib/setting';

import * as chai from 'chai';
var assert = chai.assert;


export class Tuls {
  public static min(file: string): string {
    let fbody = fs.readFileSync(file, 'utf8');
    let result = fbody.replace(/[\r|\n|\t| ]/g, '');
    return result;
  }

  public static assertCmpText(indir: string, outdir: string, infoTemplate: def.InfoTemplate) {
    let indirob = path.join(indir, '__check__', infoTemplate.id);
    if (fs.existsSync(indirob)) {
      let filesout: string[] = [];
      $.readAbsFileRec([indirob], filesout, [infoTemplate.ext]);
      _.each(filesout, (val) => {
        let outfile = path.relative(indirob, val);
        outfile = path.join(outdir, outfile);
        if (!fs.existsSync(outfile)) throw Error(`${infoTemplate.id}. Not found file ${outfile}. It must conform to the model sample ${indirob}`);
        if (this.min(outfile) !== this.min(val)) throw Error(`${infoTemplate.id}. File ${outfile} do not match . It must conform to the model sample ${indirob}`);
      });
    }
  }

  public static eachTempl(indir: string, outdir: string, exclude: Ids, fn: (val: Template) => void) {
    var model = new Model(indir);
    assert.isTrue(model.proccess(Setting.validatorJSON), model.getLastDisplayError());
    _.each(Setting.templates, (val, key) => {
      if (!_.isEmpty(exclude) && _.isUndefined(exclude[val.getId()])) return;
      assert.isTrue(val.proccess(model, outdir), val.getLastDisplayError());
      fn(val);
    });
  }
}
