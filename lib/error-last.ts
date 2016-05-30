import {Utils as $} from './utils';

export class ErrorLast {
  private errors: string[] = [];

  public isError(): boolean {
    return this.errors.length != 0;
  }

  protected resetError() {
    this.errors = [];
  }

  protected error(error: string, file: string = '') {
    let _if = (cond: boolean, f: () => string) => {
      return cond ? f() : '';
    }
    this.errors.push(`${_if(file !== '', () => `file: ${$.relpath(file)}, `)}${error}`);
  }

  public getLastDisplayError(): string {
    let eol = require('os').EOL;
    return this.errors.join(eol);
  }
}
