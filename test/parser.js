const fs = require('fs');
const assert = require('assert');
const PEG = require('pegjs');

const grammarPath = 'lib/grammar.peg';
const grammar = fs.readFileSync(grammarPath).toString();

function parseRule(rule) {
  return PEG.buildParser(grammar, {allowedStartRules: [rule]}).parse;
}

describe('MML Parser', () => {
  describe('Document', () => {
    const parse = parseRule('Document');

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
