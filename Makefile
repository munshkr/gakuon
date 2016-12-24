.PHONY: test parser player test-sid install-deps

all: parser player test

install-deps:
	npm install

test:
	npm test

parser: lib/parser.js

lib/parser.js: lib/grammar.peg
	node_modules/.bin/pegjs --cache --output $@ $< 

CC_TPL=script/compile_templates.js

player: lib/player/sid.js lib/player/prg.js

lib/player/sid.js: lib/player/sid.asm $(wildcard lib/player/_*.asm) $(wildcard lib/player/**/_*.asm)
	$(CC_TPL) $^

lib/player/prg.js: lib/player/prg.asm $(wildcard lib/player/_*.asm) $(wildcard lib/player/**/_*.asm)
	$(CC_TPL) $^

SRC=$(wildcard lib/**/*.js)
MML=$(wildcard test/fixtures/*.mml)
SID=$(MML:.mml=.sid)

test-sid: $(SID)
	for sid in $^; do sidplayfp -t10 $$sid; done

%.sid: %.mml $(SRC)
	bin/gakuon -o $@ $<

clean:
	rm -f $(SID) lib/parser.js lib/player/sid.js lib/player/prg.js
