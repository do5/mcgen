import * as Handlebars from 'handlebars';
import * as _ from 'underscore';
import {helpershbs} from './global-handler-hbs';
import * as fs from 'fs-extra';

export class CodeBuider {

  public static regGlobals() {
    CodeBuider.regs(helpershbs);
  }

  private static regs(helpers: { [key: string]: Function }) {
    _.each(helpers, (val, key) => {
      Handlebars.registerHelper(key, val);
    });
  }

  public static regFromFile(file: string): string[] {
    if (!fs.existsSync(file)) return [];
    let fns = fs.readFileSync(file, 'utf8');
    var func = new Function('require', fns);
    var helpers = func.call(this, require);
    CodeBuider.regs(helpers);
    return _.keys(helpers);
  }

  public static unreg(helpers: string[]) {
    _.each(helpers, (helper) => {
      Handlebars.unregisterHelper(helper);
    })
  }


}

