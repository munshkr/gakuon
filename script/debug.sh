#!/bin/bash
set -euf -o pipefail

make clean && make parser player
bin/gakuon --source --player --output /tmp/$1.asm $1
node_modules/.bin/6502asm.js --symbols /tmp/$1.sym --output /tmp/$1.prg /tmp/$1.asm
script/moncommands.py /tmp/$1.sym /tmp/$1.mon
x64 +confirmexit -moncommands /tmp/$1.mon /tmp/$1.prg
