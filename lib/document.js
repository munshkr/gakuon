'use strict';

const _parse = require('./parser').parse;

class Document {
  constructor(source) {
    this.source = source;
  }

  get AST() {
    return this._AST = this._AST || _parse(this.source);
  }

  get directives() {
    return this._directives = this._directives ||
      this.AST.body.filter((elem) => {
        return elem.type === 'directive';
      });
  }
}

module.exports = Document;
