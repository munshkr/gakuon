const fs = require('fs');
const assert = require('assert');

const parse = require('../lib/parser').parse;

describe('MML Parser', () => {
  describe('Document', () => {
    it('can have Headers', () => {
      assert.deepEqual(
        parse(`#TITLE My song
                       #AUTHOR n0x\n`),
        {
          type: 'document',
          body: [{
            type: 'directive',
            name: 'title',
            arg: 'My song',
          }, {
            type: 'directive',
            name: 'author',
            arg: 'n0x',
          }]
        });
    });
  });
});
