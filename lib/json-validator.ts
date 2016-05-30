import * as jsen from 'jsen';
import * as fs from 'fs-extra';
import {ErrorLast} from './error-last';

export class JsonValidator extends ErrorLast {
  private validate_shema: Jsen.JsenValidator;
  private lastValidate: Object;

  constructor(private shemaPath: string) {
    super();
    this.validate_shema = jsen(fs.readJsonSync(shemaPath));
  }

  public validate(json: string | Object): boolean {
    this.resetError();
    this.lastValidate = null;
    if (!(json instanceof Object)) {
      try {
        json = fs.readJsonSync(<string>json);
      } catch (error) {
        this.error(error);
        return false;
      }
    }

    this.lastValidate = json;

    if (!this.validate_shema(this.lastValidate)) {
      for (let i = 0; i < this.validate_shema.length; i++) {
        this.error(JSON.stringify(this.validate_shema.errors));
      }
      return false;
    }

    return true;
  }

  public getLastValidate(): Object {
    return this.lastValidate;
  }
}
