const _parse = require('./parser').parse;
const State = require('./state');

const defaultChannelState = {
  tempo: 120,
  noteLength: 4,
  quantLength: 8,

  attack:  0,
  decay:   0,
  sustain: 0xf,
  release: 0,
};

class Document {
  constructor(source) {
    this._source = Object.freeze(source);
  }

  get directives() {
    if (this._directives) return this._directives;

    let res = {};
    for (let elem of this.AST.body) {
      if (elem.type === 'directive') {
        res[elem.name] = elem.arg;
      }
    }

    return this._directives = res;
  }

  get commands() {
    return this._commands = this._commands ||
      this.AST.body.filter(elem => {
        return elem.type === 'command';
      });
  }

  get initialState() {
    // TODO Get initial state from all non-note commands before the first note
    // command in AST.  This way we avoid letting the player routine do work
    // that could be preprocessed by the compiler.
    let states = [];
    for (let i = 0; i < 3; i++) {
      states.push(new State(defaultChannelState));
    }
    return states;
  }

  get AST() {
    return this._AST = this._AST || _parse(this._source);
  }
}

module.exports = Document;
