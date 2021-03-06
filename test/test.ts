import * as $ from '../lib/utils';
import * as chai from 'chai';
import {Setting, Ids}  from './../lib/setting';
import * as fs from 'fs-extra';
import * as path from 'path';
import {Model} from './../lib/model';
import * as _ from 'underscore';
import { Tuls as $t} from './test-utils';

import {CmdUtils} from './../lib/cmd-utils';

import * as child_process from 'child_process';

var assert = chai.assert;

let indir = path.join(Setting.test_items_dir);
let outdir = path.join(Setting.test_out_dir);
fs.emptyDirSync(outdir);
let firststep = () => {
  Setting.reset();
  Setting.postinit();
  Setting.mp_console = false;
};
//Init
Setting.postinit();
Setting.mp_console = false;

function ok_all_tests(ppath: string) {
  let _indir = path.join(indir, ppath);
  let _outdir = path.join(outdir, ppath);
  describe('check ' + ppath, () => {
    it('should be ok', () => {
      firststep();
      var model = new Model(_indir);
      assert.isTrue(model.proccess(Setting.validatorJSON), model.getLastDisplayError());
      _.each(Setting.templates, (val, key) => {
        let f = val.proccess(model, _outdir);
        assert.isTrue(val.proccess(model, _outdir), val.getLastDisplayError());
        assert.doesNotThrow(() => $t.assertCmpText(_indir, _outdir, val.getInfo()));
      })
    });
  });
}

ok_all_tests(path.join('pn-model'));

ok_all_tests(path.join('mcgen-config', 'test1'));

ok_all_tests(path.join('example'));

ok_all_tests(path.join('import', 'ok2'));

ok_all_tests(path.join('import', 'crosslevel'));

describe('model shouldt be properties duplication', () => {
  let _indir = path.join(indir, 'dubl-model-prop');
  let _outdir = path.join(outdir, 'dubl-model-prop');
  it('should error', () => {
    firststep();
    var model = new Model(_indir);
    assert.isFalse(model.proccess(Setting.validatorJSON), model.getLastDisplayError());
  });
});


describe('check not import error', () => {
  let _indir = path.join(indir, 'import', 'errornotadd');
  let _outdir = path.join(outdir, 'import', 'errornotadd');
  it('should error', () => {
    firststep();
    var model = new Model(_indir);
    assert.isFalse(model.proccess(Setting.validatorJSON), model.getLastDisplayError());
  });
});


describe('const shouldt be type in model', () => {
  let _indir = path.join(indir, 'const-type-err');
  let _outdir = path.join(outdir, 'const-type-err');
  it('should error', () => {
    firststep();
    var model = new Model(_indir);
    assert.isFalse(model.proccess(Setting.validatorJSON), model.getLastDisplayError());
  });
});

describe('check big project', () => {
  let _indir = path.join(indir, 'big-proj');
  let _outdir = path.join(outdir, 'big-proj');
  it('should ok', () => {
    firststep();
    $t.eachTempl(_indir, _outdir, { 'php': {}, 'eloquent-php': {} }, (val) => {
      assert.doesNotThrow(() => $t.assertCmpText(_indir, _outdir, val.getInfo()));
    });
  });
});


describe('check only enums', () => {
  let _indir = path.join(indir, 'enums');
  let _outdir = path.join(outdir, 'enums');
  it('should ok', () => {
    firststep();
    var model = new Model(_indir);
    assert.isTrue(model.proccess(Setting.validatorJSON), model.getLastDisplayError());
    let val = Setting.templates['php'];
    assert.isTrue(val.proccess(model, _outdir), val.getLastDisplayError());
  });
});

describe('check eloquent', () => {
  let _indir = path.join(indir, 'eloquent');
  let _outdir = path.join(outdir, 'eloquent');
  it('should eloquent ok', () => {
    firststep();
    var model = new Model(_indir);
    assert.isTrue(model.proccess(Setting.validatorJSON), model.getLastDisplayError());
    let val = Setting.templates['eloquent-php'];
    assert.isTrue(val.proccess(model, _outdir), val.getLastDisplayError());
    val = Setting.templates['php'];
    assert.isTrue(val.proccess(model, _outdir), val.getLastDisplayError());
  });
});

describe('check not support enums', () => {
  let _indir = path.join(indir, 'enums-const-php');
  let _outdir = path.join(outdir, 'enums-const-php');
  it('should in php int instead of enum', () => {
    firststep();
    var model = new Model(_indir);
    assert.isTrue(model.proccess(Setting.validatorJSON), model.getLastDisplayError());
    let val = Setting.templates['php'];
    assert.isTrue(val.proccess(model, _outdir), val.getLastDisplayError());
    let body: string = fs.readFileSync(path.join(_outdir, 'model.php'), 'utf8');
    assert.isTrue(body.indexOf('@property int $prop2') >= 0, `Not find '@property int $prop2'`);
  });
});

describe('Model import ok', () => {
  let _indir = path.join(indir, 'import', 'ok');
  let _outdir = path.join(outdir, 'import', 'ok');
  it('assert (json, yaml) import/ok', () => {
    firststep();
    Setting.mp_idsTemplate = new CmdUtils().parseids('php:ver=5');
    var model = new Model(_indir);
    assert.isTrue(model.proccess(Setting.validatorJSON), model.getLastDisplayError());
    _.each(Setting.templates, (val, key) => {
      val.getInfo()
      assert.isTrue(val.proccess(model, _outdir), val.getLastDisplayError());
    })
    Setting.mp_idsTemplate = {};
  });
});


describe('check type', () => {
  beforeEach(() => {
    firststep();
  });

  it('should error type', () => {
    let _indir = path.join(indir, 'type-check', 'dublication');
    let _outdir = path.join(outdir, 'type-check', 'dublication');
    var model = new Model(_indir);
    assert.isFalse(model.proccess(Setting.validatorJSON), model.getLastDisplayError());
  });
  it('should empty model ok', () => {
    let _indir = path.join(indir, 'type-check', 'emptymodel');
    let _outdir = path.join(outdir, 'type-check', 'emptymodel');
    var model = new Model(_indir);
    assert.isTrue(model.proccess(Setting.validatorJSON), model.getLastDisplayError());
  });
  it('should error type', () => {
    let _indir = path.join(indir, 'type-check', 'error-notype');
    let _outdir = path.join(outdir, 'type-check', 'error-notype');
    var model = new Model(_indir);
    assert.isFalse(model.proccess(Setting.validatorJSON), model.getLastDisplayError());
  });
  it('should error arrayparam', () => {
    let _indir = path.join(indir, 'type-check', 'error-arrayparam');
    let _outdir = path.join(outdir, 'type-check', 'error-arrayparam');
    var model = new Model(_indir);
    assert.isFalse(model.proccess(Setting.validatorJSON), model.getLastDisplayError());
  });
  it('should ok import type', () => {
    let _indir = path.join(indir, 'type-check', 'ok-import');
    let _outdir = path.join(outdir, 'type-check', 'ok-import');
    var model = new Model(_indir);
    assert.isTrue(model.proccess(Setting.validatorJSON), model.getLastDisplayError());
  });
});

describe('Model import error validation', () => {
  let _indir = path.join(indir, 'import', 'error');
  let _outdir = path.join(outdir, 'import', 'error');
  beforeEach(() => {
    firststep();
  });
  it('assert (json, yaml) import/error', () => {
    var model = new Model(_indir);
    assert.isFalse(model.proccess(Setting.validatorJSON), model.getLastDisplayError());
  });
});

describe('Parse cmd', () => {
  beforeEach(() => {
    firststep();
  });
  it('parse --id *', () => {
    let val = new CmdUtils().parseids('*');
    assert.deepEqual(val, {});
  })
  it('parse --id php', () => {
    let val = new CmdUtils().parseids('php');
    let valeq: Ids = {};
    valeq['php'] = {};
    assert.deepEqual(val, valeq);
  })
  it('parse --id php,cs', () => {
    let val = new CmdUtils().parseids('php,cs');
    let valeq: Ids = {};
    valeq['php'] = {};
    valeq['cs'] = {};
    assert.deepEqual(val, valeq);
  })
  it('parse --id php:ver=5,cs:ident=2', () => {
    let val = new CmdUtils().parseids('php:ver=5;data=5,cs:ident=2');
    let valeq: Ids = {};

    valeq['php'] = {
      'ver': '5',
      'data': '5'
    };
    valeq['cs'] = {
      'ident': '2'
    };
    assert.deepEqual(val, valeq);
  })
});

describe('Proccess', () => {
  var _indir = path.join(indir, 'import', 'ok');
  var _outdir = path.join(outdir, 'import', 'ok');

  it('exec via import', (done) => {
    child_process.exec(`node ${path.join(Setting.__root, 'lib', 'mcgen')}  build --indir ${_indir} --outdir ${_outdir}`, (err, stdout, stderr) => {
      if (err) return done(err);
      if (stdout.indexOf('Usage:') >= 0) return done('Error run'); //if help
      done();
    });
  });

});

