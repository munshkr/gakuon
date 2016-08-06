#!/usr/bin/env node
const process = require('process');
const fs = require('fs');
const path = require('path');

const compile = require('../lib/compiler').compile;
const Assembler = require('6502asm').Assembler;
const defaultOut = './song.sid';

let program = require('commander');

program
  .usage('[options] <file>')
  .option('-o, --output [file]', `output file`)
  .option('-s, --source', 'generate assembly source code')
  .option('--player',
    'generate a C64 executable player .prg instead of .sid file')
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(1);
}

if (program.args.length === 0) {
  console.error(`Missing source file`)
  process.exit(1);
}

if (program.args.length > 1) {
  console.error(`Invalid arguments: ${program.args}`)
  process.exit(1);
}


function abort(err) {
  if (err.location) {
    let loc = err.location.start;
    console.error(`${err.message}, at ${loc.line}:${loc.column}`);
  } else {
    console.error(err);
  }
  process.exit(1);
}

function outputPathFromOptions(program) {
  let inputPath = program.args[0];
  let basename = path.basename(inputPath, path.extname(inputPath));

  let newExt;
  if (program.source) {
    newExt = '.asm';
  } else if (program.player) {
    newExt = '.prg';
  } else {
    newExt = '.sid';
  }

  return `${basename}${newExt}`;
}

let inputPath = program.args[0];
let outputPath = program.output || outputPathFromOptions(program);

try {
  const source = fs.readFileSync(inputPath).toString();

  const templatePath = path.join(__dirname, program.player ?
    '../lib/player/prg_player.asm' : '../lib/player/sid_player.asm');
  const template = fs.readFileSync(templatePath).toString();

  let out = compile(source, { template: template });

  if (program.source) {
    fs.writeFileSync(outputPath, out);
  } else {
    let assembler = new Assembler();
    let {objectCode} = assembler.assemble(out);
    let buf = Buffer.from(objectCode);
    fs.writeFileSync(outputPath, buf);
  }
} catch(err) {
  abort(err);
}
