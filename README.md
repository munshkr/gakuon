# gakuon 楽音 [![Build Status](https://travis-ci.org/munshkr/gakuon.svg?branch=master)](https://travis-ci.org/munshkr/gakuon)

A Music Macro Language (MML) compiler for the C64 SID chip.

This repository contains only the MML compiler of Gakuon. For the visual
editor, see [here](https://github.com/munshkr/gakuon-editor).

*NOTE: This is still in pre-alpha stage.* **It doesn't work!**

Right now I'm working on:

  - SID player routine
  - MML syntax
  - MML compiler
  - Tests
  - Documentation

Read the [MML reference](https://github.com/munshkr/gakuon/wiki/MML-Reference) to
know more about the syntax.  It is inspired on
[ppmck](http://shauninman.com/assets/downloads/ppmck_guide.html),
[xpmck](http://jiggawatt.org/muzak/xpmck/) and
[MMLX](https://github.com/ccampbell/mmlx) compilers.

Chat with us at [Gitter](https://gitter.im/munshkr/gakuon)!

## Usage

```javascript
const gk = require('gakuon');

let source = "A l8 ccdd eeff\n";

// Parse string and compile into assembly code
let compiler = new gk.Compiler();
let asm = compiler.compile(source);

// You can get information about the MML document with the
// Document object:
let doc = new gk.Document(source);
console.log(doc.initialState.noteLength);  // 8

let codeGen = new gk.CodeGenerator(doc);
asm = codeGen.generate();
```

## Development

After cloning repo, install all packages with `npm install`.

To run all tests, use `make` or `make test`.

You might need these other dependencies for some of them:

  * [Vice](http://vice-emu.sourceforge.net/) emulator
  * [sidplayfp](https://sourceforge.net/projects/sidplay-residfp/) ReSID player

### MML parser

Uses [PEG.js](http://pegjs.org/) to build a PEG parser for MML files.

Update grammar file `lib/grammar.peg` and execute `make` to compile and run
unit tests.


## Contributing

Bug reports and pull requests are welcome on GitHub at
https://github.com/munshkr/gakuon.


## License

Source code is released under [Apache 2 license](LICENSE).
