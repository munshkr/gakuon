const _parse = require('./lib/parser').parse;

class Parser {
  parse(string) {
    return _parse(string);
  }
};

module.exports = {
  Compiler: require('./lib/compiler'),
  Document: require('./lib/document'),
  CodeGenerator: require('./lib/code_generator'),
  Parser: Parser
}
