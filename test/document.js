const assert = require('assert');

const Document = require('../lib/document');

describe('Document', () => {
  describe('source', () => {
    it('is the original source string', () => {
      let doc = new Document('A cdef');

      assert.equal(doc.source, 'A cdef');
    });
  });

  describe('AST', () => {
    it('is the parsed abstract syntax tree (AST)', () => {
      let doc = new Document('A c4.');

      assert.deepEqual(doc.AST, {
        type: 'document',
        body: [{ type: 'command', channels: ['A'], sequence: [
          { type: 'note', note: 'c', length: 4, dots: 1, accidental: null },
        ] }]
      });
    });
  });
});
