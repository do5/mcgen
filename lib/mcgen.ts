import * as fs from 'fs-extra';
import * as path from 'path';
import * as program from 'commander';

import {Setting}  from './setting';
import {Model} from './model';

import {CmdUtils}  from  './cmd-utils';
import {Utils as $}  from  './utils';
import * as _ from 'underscore';

let package_json = fs.readJsonSync(path.join(__dirname, '..', 'package.json'));

let cmd = new CmdUtils();

program
  .version(package_json.version)
  .command("build", {isDefault:true})
  .description(package_json.description)
  .option('-o, --outdir <path>', "output base dir created files", (val) => { Setting.mp_outdir = cmd.emptydir(val) })
  .option('-n, --indir <path>', "model input base dir. Example: test/design-rules.json.", (val) => { Setting.mp_indir = cmd.indir(val) })
  .option('-d, --id <id_1[:arg_name=arg_val;arg_name=arg_val]>,<id_n>', "Array id template to use", (val) => {
     Setting.mp_idsTemplate = cmd.parseids(val)
     Setting.mp_idsTemplateOnlyCmd = cmd.parseids(val)
    })
  .option('-t, --template-path <path>', "the path to user template. See struct folders 'template'", (val) => { Setting.mp_templ_user_dir = cmd.templdir(val) })
  .on('--help', function () {
    console.log('  Examples:');
    console.log();
    console.log(`   $ ${program.name()} build --indir def/model --outdir src/model`);
    console.log(`   $ ${program.name()} build --indir def/model --outdir src/model --id php:ver=5;def=true,cs:ident=2`);
    console.log(`   $ ${program.name()} build --indir def/model --outdir src/model --id php:ver=5;def=true,cs:ident=2 --template-path user_template`);
    console.log(`   $ ${program.name()} list --template-path user_template`);
    console.log(`   $ ${program.name()} init new_project`);
    console.log();
  });

program.command('list')
  .description('List all template with params')
  .action(function (req, options) {
    Setting.postinit();
    _.each(Setting.templates, (v) => {
      console.log(v.getDisplayInfo());
      console.log();
    });
    process.exit(0);
  });

program.command('init <dir>')
  .description('Create template a model project')
  .action(function (dir, options) {
    let sdir = dir;
    dir = cmd.emptydir(dir);
    fs.copySync(path.join(Setting.test_items_dir, 'example'), dir);
    fs.removeSync(path.join(dir,'__check__'));
    console.log(`Project successfully created.`);
    console.log(`To use: '${program.name()} --indir ${sdir} --outdir <outdir>'`);
    console.log(`We recommend add in a file 'package.json' => script: {"build-mcgen": "${program.name()} --indir ${sdir} --outdir <outdir>"}`);
    process.exit(0);
  });

program.parse(process.argv);

if (cmd.isError()) {
  console.error(cmd.getLastDisplayError());
  process.exit(-1)
}

if ($.isEmptyString(Setting.mp_indir) || $.isEmptyString(Setting.mp_outdir)) {
  program.help();
  process.exit(0)
}


Setting.postinit();
$.consoleProccess(`Output dir '${Setting.mp_outdir}'`);

var model = new Model(Setting.mp_indir);
if (!model.proccess(Setting.validatorJSON)) {
  $.consoleError(`Error validation ${model.getLastDisplayError()}`);
  process.exit(-1);
}

_.each(Setting.templates, (val, key) => {
  if (!_.isEmpty(Setting.mp_idsTemplate) && _.isUndefined(Setting.mp_idsTemplate[val.getId()])) return;

  $.consoleProccess(`Proccess '${val.getId()}' `);
  if (!val.proccess(model, Setting.mp_outdir)) {
    $.consoleError(`Error validation ${val.getLastDisplayError()}`);
    process.exit(-1);
  }
});

process.exit(0);
