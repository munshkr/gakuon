const assert = require('assert');

const Compiler = require('../lib/compiler');

describe('Compiler', () => {
  describe('#compile', () => {
    it('accepts a source string and returns assembly code', () => {
      let compiler = new Compiler();
      assert.equal(typeof(compiler.compile('A cde')), 'string');
    });
  });
});
