const assert = require('assert');
const fs = require('fs');
const PEG = require('pegjs');
const path = require('path');

const grammar = fs.readFileSync(path.join(__dirname, '../lib/grammar.peg')).toString();
const parse = PEG.buildParser(grammar).parse;

function buildDocument(body) {
  body = body || [];
  return { type: 'document', body: body };
}

describe('MML Parser', () => {
  describe('Directive', () => {
    it('starts with a # and has a name', () => {
      assert.deepEqual(parse('#foo'),
        buildDocument([{ type: 'directive', name: 'foo', arg: null }])
      );

      assert.deepEqual(parse('  #with_ws \n'),
        buildDocument([{ type: 'directive', name: 'with_ws', arg: null }])
      );
    });

    it('has arguments', () => {
      assert.deepEqual(parse('#title this song'),
        buildDocument([{ type: 'directive', name: 'title', arg: 'this song' }])
      );

      assert.deepEqual(parse('  #with_ws   foo\n\n'),
        buildDocument([{ type: 'directive', name: 'with_ws', arg: 'foo' }])
      );
    });
  });

  describe('Instrument', () => {
    let prg = (bodies) => {
      return buildDocument([{
        type: 'instrument',
        name: 'foo',
        bodies: bodies
      }]);
    };

    it('has a name and an empty body', () => {
      assert.deepEqual(parse('foo { }'), prg([ {} ]));
    });

    it('has a body with parameters', () => {
      assert.deepEqual(parse('foo { a: 0, b: 1, c: 2 }'),
        prg([ { a: { type: 'number', value: 0 },
                b: { type: 'number', value: 1 },
                c: { type: 'number', value: 2 } } ]));
    });

    it('has many bodies, separated by commas', () => {
      assert.deepEqual(parse('foo { a: 0 }, { b: 1 }'),
        prg([ { a: { type: 'number', value: 0 } },
              { b: { type: 'number', value: 1 } } ]));
    });

    it('has many instrument identifiers, separated by commas', () => {
      assert.deepEqual(parse('foo lead, guitar'),
        prg([ 'lead', 'guitar' ]));
    });

    it('has both bodies and identifiers, separated by commas', () => {
      assert.deepEqual(parse('foo { a: 1 }, bass'),
        prg([ { a: { type: 'number', value: 1 } },
              'bass' ]));
    });

    describe('ParameterValue', () => {
      it('is a number literal', () => {
        assert.deepEqual(parse('foo { a: 42 }'),
          prg([ { a: { type: 'number', value: 42 } } ]));
      });

      it('is an interval', () => {
        assert.deepEqual(parse('foo { a: 1:10 }'),
          prg([ { a: { type: 'interval', from: 1, to: 10, step: null } } ]));
      });

      it('is a number with a repeat marker', () => {
        assert.deepEqual(parse('foo { a: 5\'4 }'),
          prg([ { a: { type: 'repeated_number', value: 5, times: 4 } } ]));
      });

      it('is a sequence', () => {
        assert.deepEqual(parse('foo { a: [1 2 3 4] }'),
          prg([ { a: { type: 'sequence', value: [
            { type: 'number', value: 1 },
            { type: 'number', value: 2 },
            { type: 'number', value: 3 },
            { type: 'number', value: 4 },
          ] } } ]));
      });
    });

    describe('NumLiteral', () => {
      it('is a decimal number', () => {
        assert.deepEqual(parse('foo { a: 42 }'),
          prg([ { a: { type: 'number', value: 42 } } ]));
      });

      it('is a negative decimal number', () => {
        assert.deepEqual(parse('foo { a: -1 }'),
          prg([ { a: { type: 'number', value: -1 } } ]));
      });

      it('is an hexadecimal number with a $ prefix', () => {
        assert.deepEqual(parse('foo { a: $fe }'),
          prg([ { a: { type: 'number', value: 0xfe } } ]));
      });

      it('is an hexadecimal number with a 0x prefix', () => {
        assert.deepEqual(parse('foo { a: 0xff }'),
          prg([ { a: { type: 'number', value: 0xff } } ]));
      });
    });

    describe('Interval', () => {
      it('has a +from+ and +to+', () => {
        assert.deepEqual(parse('foo { a: 0:4 }'),
          prg([ { a: { type: 'interval', from: 0, to: 4, step: null } } ]));
      });

      it('has an optional +step+ value', () => {
        assert.deepEqual(parse('foo { a: 1:10:3 }'),
          prg([ { a: { type: 'interval', from: 1, to: 10, step: 3 } } ]));
      });
    });
  });

  describe('Document', () => {
    it('can have Headers', () => {
      assert.deepEqual(
        parse(`#TITLE My song
                       #AUTHOR n0x\n`),
        buildDocument([
          { type: 'directive', name: 'title', arg: 'My song' },
          { type: 'directive', name: 'author', arg: 'n0x' }
        ])
      );
    });
  });
});
