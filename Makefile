.PHONY: test test-sid install-deps

all: test

install-deps:
	npm install

test:
	npm test
	$(MAKE) test-sid

SRC=$(wildcard lib/**/*.js)
MML=$(wildcard test/fixtures/*.mml)

test-sid: $(MML:.mml=.sid)
	sidplayfp $<

%.sid: %.asm
	node_modules/.bin/6502asm.js -o $@ $<

%.asm: %.mml $(SRC)
	node ./index.js $< -o $@
