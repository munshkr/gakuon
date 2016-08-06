.PHONY: test parser test-sid install-deps

all: parser test

install-deps:
	npm install

test:
	npm test

parser: lib/parser.js

lib/parser.js: lib/grammar.peg
	node_modules/.bin/pegjs --cache lib/grammar.peg lib/parser.js

SRC=$(wildcard lib/**/*.js)
MML=$(wildcard test/fixtures/*.mml)

test-sid: $(MML:.mml=.sid)
	sidplayfp $<

%.sid: %.asm
	node_modules/.bin/6502asm.js -o $@ $<

%.asm: %.mml $(SRC)
	bin/gakuon -s -o $@ $<
