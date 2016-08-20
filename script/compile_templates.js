#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const process = require('process');
const ejs = require('ejs');

if (!process.argv.slice(2).length) {
  console.error(`
  Usage: ${path.relative(process.cwd(), __filename)} SOURCE [INCLUDE..]

  SOURCE is the main template file.

  INCLUDE is an optional list of templates that are needed in case SOURCE
  or other template in INCLUDE uses the include() helper function.
`);
  process.exit(1);
}

function outputPathFrom(sourcePath) {
  let dir = path.dirname(sourcePath);
  let basename = path.basename(sourcePath, path.extname(sourcePath));
  return path.join(dir, `${basename}.js`);
}

function include(includePath, includedData) {
  return templates[includePath](includedData);
}

let sourcePath = process.argv[2];
let includePaths = process.argv.slice(3);

let templates = {};

// Compile all included files except source inside "templates" object
let sourceDirname = path.dirname(sourcePath);
for (let includePath of includePaths) {
  let basename = path.relative(sourceDirname, includePath);
  let includeSource = fs.readFileSync(includePath).toString();

  if (!templates[basename]) {
    templates[basename] = ejs.compile(includeSource, {
      filename: includePath,
      client: true,
      strict: true,
      _with: false
    });
  }
}

// Include templates object for include()
let __module = 'var templates = {\n';
for (let b in templates) {
  __module += `${JSON.stringify(b)}: function(data) {\n` +
    `var include = ${include};\n` +
    `var fn = ${templates[b]};\n` +
    `return fn(data, null, include);\n},\n`;
}
__module += `};\n\n`;

// Finally include template function for source
let source = fs.readFileSync(sourcePath).toString();
let sourceFn = ejs.compile(source, {
  filename: sourcePath,
  client: true,
  strict: true,
  _with: false
});
__module += `module.exports = function(data) {\n` +
  `var include = ${include};\n` +
  `var fn = ${sourceFn};\n` +
  `return fn(data, null, include);\n}\n;`;

// Output __module
let outputPath = outputPathFrom(sourcePath);
fs.writeFileSync(outputPath, __module);
