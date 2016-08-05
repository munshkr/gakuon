#!/usr/bin/env node
const process = require('process');
const fs = require('fs');
const path = require('path');
const PEG = require('pegjs');

const compile = require('../lib/compiler').compile;
const defaultOut = './song.asm';

let program = require('commander');

program
  .usage('[options] <file>')
  .option('-o, --output [file]',
    `output file (default: ${defaultOut})`, defaultOut)
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

let inputPath = program.args[0];
let outputPath = program.output;

const source = fs.readFileSync(inputPath).toString();

const templatePath = path.join(__dirname, program.player ?
  '../lib/player/prg_player.asm' : '../lib/player/sid_player.asm');
const template = fs.readFileSync(templatePath).toString();

let out = compile(source, { template: template });

if (program.source) {
  fs.writeFileSync(outputPath, out);
} else {
  console.error('Assembler not implemented yet. Use --source for now.');
  process.exit(1);
}
