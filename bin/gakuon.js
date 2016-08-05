#!/usr/bin/env node
const process = require('process');
const fs = require('fs');
const path = require('path');
const PEG = require('pegjs');

const compile = require('../lib/compiler').compile;

const DEFAULT_OUT = './song.asm';
const GRAMMAR_PATH = path.resolve(__dirname, '../lib/grammar.peg');

function generateParser(grammarPath, options) {
  const grammar = fs.readFileSync(grammarPath).toString();
  return PEG.buildParser(grammar, options);
}

function parse(source, options) {
  const parser = generateParser(GRAMMAR_PATH, options)
  const ast = parser.parse(source);
  if (options.printAst) {
    console.log("=== AST ===");
    console.dir(ast, {colors: true, depth: null});
  }
  return ast;
}

let program = require('commander');

program
  .usage('[options] <file>')
  .option('-o, --output [file]',
    `output .asm file (default: ${DEFAULT_OUT})`, DEFAULT_OUT)
  .parse(process.argv);

if (program.args.length !== 1) {
  console.error(`Invalid arguments: ${program.args}`)
  process.exit(1);
}

let inputPath = program.args[0];
let outputPath = program.output;

const source = fs.readFileSync(inputPath).toString();
let ast = parse(source, { printAst: program.printAst });
let out = compile(ast);
fs.writeFileSync(outputPath, out);
