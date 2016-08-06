.PHONY: test parser player test-sid install-deps

all: parser player test

install-deps:
	npm install

test:
	npm test

parser: lib/parser.js

lib/parser.js: lib/grammar.peg
	node_modules/.bin/pegjs --cache lib/grammar.peg lib/parser.js

CC_TPL=script/compile_templates.js
PLAYER_SRC=$(wildcard lib/player/*.asm) $(wildcard lib/player/**/*.asm)

player: lib/player/sid.js lib/player/prg.js

lib/player/sid.js: lib/player/sid.asm $(PLAYER_SRC)
	$(CC_TPL) $^

lib/player/prg.js: lib/player/prg.asm $(PLAYER_SRC)
	$(CC_TPL) $^

SRC=$(wildcard lib/**/*.js)
MML=$(wildcard test/fixtures/*.mml)
SID=$(MML:.mml=.sid)

test-sid: $(SID)
	sidplayfp $<

%.sid: %.asm
	node_modules/.bin/6502asm.js -o $@ $<

%.asm: %.mml $(SRC)
	bin/gakuon -s -o $@ $<

clean:
	rm -f $(SID) lib/parser.js lib/player/sid.js lib/player/prg.js
