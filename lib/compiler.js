'use strict';

function template(strings, ...keys) {
  return (function(...values) {
    var dict = values[values.length - 1] || {};
    var result = [strings[0]];
    keys.forEach(function(key, i) {
      var value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join('');
  });
}

const generateSource = template`
;;
;; Header for a PSID v2NG file
;; See http://cpansearch.perl.org/src/LALA/Audio-SID-3.11/SID_file_format.txt
;;
;; load address
BASEADDR = $1000
;; flags
;; NOTE when using PAL or NTSC, set also SP_PAL or SP_NTSC in SPEED flag
F_MISC = 2  ; built-in player
F_PAL  = 4
F_NTSC = 8
F_MOS6581 = 16
F_MOS8580 = 32
;FLAGS = F_MOS6581 | F_PAL | F_MISC
FLAGS = 22
;; speed flag
C_PAL  = 0
C_NTSC = 1
;CLOCK = C_PAL
CLOCK = 0
;;
.aasc "PSID"              ; magicId
.byte 0,2                 ; version
.byte 0,$7c               ; dataOffset
.byte >BASEADDR,<BASEADDR ; loadAddress (loadAddress == dataOffset)
.byte >init,<init         ; initAddress
.byte >play,<play         ; playAddress
.byte 0,1                 ; songs
.byte 0,1                 ; startSong
.word 0,CLOCK             ; speed
.aasc "${'title'}"
.aasc "${'author'}"
.aasc "${'released'}"
.byte 0,FLAGS             ; flags (PAL 6581 only)
.byte 0                   ; startPage
.byte 0                   ; pageLength
.byte 0,0                 ; (reserved)

* = BASEADDR

;; === defines ===

CMD_REST = $60

;; === code ===

init:
  ;; Set initial ADSR
  lda #$10
  sta $d405   ; AD#1 (500ms attach, 1.5s decay)
  lda #$e1
  sta $d406   ; SR#1 (10/16 sustain, 1.5s release)

  ;; Set initial PW
  ;; pw#1 = $800 (square wave)
  lda #$0
  sta $d402
  lda #$8
  sta $d403

  rts

play:
  ;;;;
  ;;;; channel #0
  ;;;;

  lda playing
  bne already_playing
  lda #1
  sta playing

  ;; load note
  ldy n
  ldx note_0, y

  lda freq_lo, x
  sta $d400
  lda freq_hi, x
  sta $d401

  ;; gate on
  lda #$11
  sta $d404   ; gate#0 on; wave#0 tri

already_playing:
  ;; decrement frame counter for note length
  ldy nc
  beq skip_next_note    ; <-- only branches when note is a command
  dey
  sty nc
  bne skip_next_note

  lda #0
  sta playing

  ;; increment pointers
  inc n
  inc nl
  inc nq

  ;; reload frame counters for note length
  ldy nl
  ldx note_len_0, y
  stx nc

  ;; reload frame counters for note quant length
  ldy nq
  ldx note_quant_0, y
  stx nqc

  ;; gate off
  lda #$10
  sta $d404   ; gate#0 off; wave#0 tri

skip_next_note:
  ldy nqc
  beq skip_gate_off
  dey
  sty nqc
  bne skip_gate_off

  ;; gate off
  lda #$10
  sta $d404   ; gate#0 off; wave#0 tri

skip_gate_off:
  rts


;; === data ===

;; boolean that indicates if it note is playing (=1) or not (=0)
playing: .byte 0, 0, 0

;; pointers for note, note_len and note_quant tables
;; TODO use words
n:  .byte 0, 0, 0
nl: .byte 0, 0, 0
nq: .byte 0, 0, 0

;; frame counters for note length
;; TODO use words
nc:  .byte ${'nc_0'}, ${'nc_1'}, ${'nc_2'}

;; frame counters for note quantization length
;; TODO use words
nqc: .byte ${'nqc_0'}, ${'nqc_1'}, ${'nqc_2'}

;; === rodata ===

initial_state_0:
initial_state_1:
initial_state_2:

;; Notes/commands tables
;;
;; $ff = end of table
;; See CMD_ labels above
;;
note_0:
  .byte ${'note_0'}
note_1:
  .byte ${'note_1'}
note_2:
  .byte ${'note_2'}

;; Note length (in frames) tables
;;
;; $ff = end of table
;;
note_len_0:
  .byte ${'noteLen_0'}
note_len_1:
  .byte ${'noteLen_1'}
note_len_2:
  .byte ${'noteLen_2'}

;; Quantization length (in frames) tables
;;
;; $ff = end of table
;;
note_quant_0:
  .byte ${'noteQuant_0'}
note_quant_1:
  .byte ${'noteQuant_1'}
note_quant_2:
  .byte ${'noteQuant_2'}

;; Frequency table for PAL
;;
freq_lo:
;        C   C#  D   D#  E   F   F#  G   G#  A   A#  B
  .byte $17,$27,$39,$4b,$5f,$74,$8a,$a1,$ba,$d4,$f0,$0e  ; 1
  .byte $2d,$4e,$71,$96,$be,$e8,$14,$43,$74,$a9,$e1,$1c  ; 2
  .byte $5a,$9c,$e2,$2d,$7c,$cf,$28,$85,$e8,$52,$c1,$37  ; 3
  .byte $b4,$39,$c5,$5a,$f7,$9e,$4f,$0a,$d1,$a3,$82,$6e  ; 4
  .byte $68,$71,$8a,$b3,$ee,$3c,$9e,$15,$a2,$46,$04,$dc  ; 5
  .byte $d0,$e2,$14,$67,$dd,$79,$3c,$29,$44,$8d,$08,$b8  ; 6
  .byte $a1,$c5,$28,$cd,$ba,$f1,$78,$53,$87,$1a,$10,$71  ; 7
  .byte $42,$89,$4f,$9b,$74,$e2,$f0,$a6,$0e,$33,$20,$ff  ; 8

freq_hi:
;        C   C#  D   D#  E   F   F#  G   G#  A   A#  B
  .byte $01,$01,$01,$01,$01,$01,$01,$01,$01,$01,$01,$02  ; 1
  .byte $02,$02,$02,$02,$02,$02,$03,$03,$03,$03,$03,$04  ; 2
  .byte $04,$04,$04,$05,$05,$05,$06,$06,$06,$07,$07,$08  ; 3
  .byte $08,$09,$09,$0a,$0a,$0b,$0c,$0d,$0d,$0e,$0f,$10  ; 4
  .byte $11,$12,$13,$14,$15,$17,$18,$1a,$1b,$1d,$1f,$20  ; 5
  .byte $22,$24,$27,$29,$2b,$2e,$31,$34,$37,$3a,$3e,$41  ; 6
  .byte $45,$49,$4e,$52,$57,$5c,$62,$68,$6e,$75,$7c,$83  ; 7
  .byte $8b,$93,$9c,$a5,$af,$b9,$c4,$d0,$dd,$ea,$f8,$ff  ; 8
`;

const VSYNC_FREQ = 50;            // PAL
const NOTES = ['c', 'c+', 'd', 'd+', 'e', 'f', 'f+', 'g', 'g+', 'a', 'a+', 'b'];

const DEFAULT_HEADER_FIELD = 'unknown';
const DEFAULT_CHANNEL_STATE = {
  tempo: 120,
  noteLength: 4,
  quant: 6,
  octave: 4,

  attack: 0,
  decay: 1,
  sustain: 14,
  release: 1,
};

String.prototype.padRight = function(l,c) {
  return this+Array(l-this.length+1).join(c||' ');
};

function framesFrom(noteLength, tempo) {
  // 14400??
  return Math.round(14400 / noteLength / tempo);
}

function getDirectives(ast) {
  return ast.body.filter((elem) => { return elem.type === 'directive'; });
}

function buildHeaders(ast) {
  const headerNames = ['title', 'author', 'released'];

  let directives = getDirectives(ast);
  let headers = {};

  for (let dir of directives) {
    if (headerNames.includes(dir.name)) {
      let value = dir.arg.trim();
      if (value.length > 32) {
        console.warn(`Argument of header #${dir.name.toUpperCase()} is ` +
          `too long (max 32 characters)`);
      }
      headers[dir.name] = value.slice(0, 32);
    }
  }

  for (let name of headerNames) {
    if (!headers[name]) {
      headers[name] = DEFAULT_HEADER_FIELD;
    }
    headers[name] = headers[name].padRight(32);
  }

  return headers;
}

function buildInitialState(ast) {
  // TODO get initial state from *first commands* in AST
  // for now, only use default values...
  let states = [];
  for (let i = 0; i < 3; i++) {
    states[i] = Object.assign({}, DEFAULT_CHANNEL_STATE);
    states[i].noteFrames = framesFrom(states[i].noteLength, states[i].tempo);
    states[i].quantFrames = Math.round(states[i].noteFrames *
      (states[i].quant / 8));
  }
  return states;
}

function noteFromCommand(command, state) {
  let res = {};

  if (command.note) {
    let nt = `${command.note}${command.accidental || ''}`;
    let octave = command.octave || state.octave;
    console.log(`note: ${nt}, octave: ${octave} -- ${NOTES.indexOf(nt)}`);
    res.note = (12 * octave) + NOTES.indexOf(nt);
  }

  // FIXME process "dots"
  if (command.length) {
    res.noteLen = framesFrom(command.length, state.tempo);
    res.noteQuant = Math.round(res.noteLen * (state.quant / 8));
  } else {
    res.noteLen = state.noteFrames;
    res.noteQuant = state.quantFrames;
  }

  return res;
}

function buildTableGroups(ast, initialStates) {
  let groups = [], states = [];

  // create tables
  for (let i = 0; i < 3; i++) {
    groups[i] = { note: [], noteLen: [], noteQuant: [] };
    states[i] = Object.assign(initialStates[i]);
  }

  for (let elem of ast.body) {
    if (elem.type === 'command') {
      for (let channel of elem.channels) {
        let i = channelNumFromName(channel);
        let state = states[i];

        for (let cmd of elem.sequence) {
          if (cmd.type === 'note') {
            let {note, noteLen, noteQuant} = noteFromCommand(cmd, state);
            groups[i].note.push(note);
            groups[i].noteLen.push(noteLen);
            groups[i].noteQuant.push(noteQuant);
          } else {
            let cmdLabel = `CMD_${cmd.type.toUpperCase()}`;

            switch (cmd.type) {
              case 'rest':
                let {_, noteLen, noteQuant} = noteFromCommand(cmd, state);
                groups[i].note.push(cmdLabel);
                groups[i].noteLen.push(noteLen);
                groups[i].noteQuant.push(noteLen);
                break;
              case 'set_tempo':
                state.tempo = cmd.value;
                break;
              case 'set_note_length':
                state.noteLength = cmd.value;
                break;
              case 'set_octave':
                state.octave = cmd.value;
                break;
              case 'set_quantize':
                state.quant = cmd.value;
                break;
              case 'inc_octave':
                state.octave = Math.min(state.octave + 1, 7);
                break;
              case 'dec_octave':
                state.octave = Math.max(state.octave - 1, 0);
                break;
              default:
                console.log(cmd);
            }

            // Update lower-level state variables (frames)
            state.noteFrames = framesFrom(state.noteLength, state.tempo);
            state.quantFrames = Math.round(state.noteFrames *
              (state.quant / 8));

            console.log(`${cmd.type} -- noteFrames <- ${state.noteFrames},` +
              `quantFrames <- ${state.quantFrames}`);
          }
        }
      }
    }
  }

  for (let i = 0; i < 3; i++) {
    groups[i].note.push(0xff);
    groups[i].noteLen.push(0xff);
    groups[i].noteQuant.push(0xff);
  }

  return groups;
}

function channelNumFromName(name) {
  let n;
  if (name === 'A') { n = 0; }
  if (name === 'B') { n = 1; }
  if (name === 'C') { n = 2; }
  return n;
}

function toAsm(value) {
  let str;
  if (typeof(value) === 'string') {
    str = value;
  } else if (typeof(value) === 'number') {
    str = `$${value.toString(16)}`;
  } else if (typeof(value) === 'object') {
    str = value.map((v) => { return toAsm(v); }).join(', ');
  }
  return str;
}

exports.compile = function(ast) {
  let vars = {};

  // build headers for SID
  vars = Object.assign(vars, buildHeaders(ast));

  let initialStates = buildInitialState(ast);
  let tablesGroups  = buildTableGroups(ast, initialStates);

  for (let i = 0; i < 3; i++) {
    // FIXME Only assign initial state of SID registers
    //let state = initialStates[i];
    let state = {};

    let tableGroup = tablesGroups[i];
    // assign initial state
    for (let key in state) {
      vars[`init_${key}_${i}`] = state[key];
    }
    // assign tables
    for (let key in tableGroup) {
      vars[`${key}_${i}`] = toAsm(tableGroup[key]);
      vars[`nc_${i}`] = toAsm(tableGroup.noteLen[0]);
      vars[`nqc_${i}`] = toAsm(tableGroup.noteQuant[0]);
    } 
  }

  console.log(vars);
  return generateSource(vars).trim();
}
