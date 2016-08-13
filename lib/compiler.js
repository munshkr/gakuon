const Document = require('./document');
const CodeGenerator = require('./code_generator');

class Compiler {
  constructor(options) {
    this.options = options || {};
    this._codeGen = new CodeGenerator(options);
  }

  compile(source) {
    const document = new Document(source);
    return this._codeGen.generate(document);
  }
};

module.exports = Compiler;
