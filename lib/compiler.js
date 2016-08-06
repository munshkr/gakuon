'use strict';

String.prototype.padRight = function(l,c) {
  return this+Array(l-this.length+1).join(c||' ');
};

Array.prototype.eachSlice = function(size, callback) {
  for (var i = 0, l = this.length; i < l; i += size) {
    callback.call(this, this.slice(i, i + size));
  }
}

const path = require('path');
const parse = require('./parser').parse;

const sidTpl = require('./player/sid');
const prgTpl = require('./player/prg');

const defaultHeaderField = 'unknown';
const defaultChannelState = {
  tempo:      120,
  noteLength: 4,
  quant:      8,

  attack:  0,
  decay:   0,
  sustain: 0xf,
  release: 0,
};

function framesFrom(noteLength, tempo) {
  // 14400??
  return Math.round(14400 / noteLength / tempo);
}

function getDirectives(ast) {
  return ast.body.filter((elem) => { return elem.type === 'directive'; });
}

function bytesFromNoteCommand(command, state) {
  let bytes = [];

  let inst;
  if (command.type === 'rest') {
    inst = 'I_NOTE_REST';
  } else {
    let note = command.note.toUpperCase();
    let accidental = command.accidental === '+' ? 'S' : '';
    inst = `I_NOTE_${note}${accidental}`;
  }

  // If note length differs from current default note length, append note
  // length and quantization length bytes
  if (command.length !== null && state.noteLength !== command.length) {
    let noteLen = framesFrom(command.length, state.tempo);
    let noteQuant = Math.round(noteLen * (state.quant / 8));

    inst = inst + '|WITH_LEN_FLAG|WITH_Q_FLAG';
    if (noteLen > 0xff) {
      inst += '|WORD_FLAG';
    }

    bytes.push(inst);

    bytes.push(noteLen & 0xff);
    if (noteLen > 0xff) {
      bytes.push(noteLen >> 8 & 0xff);
    }

    bytes.push(noteQuant & 0xff);
    if (noteQuant > 0xff) {
      bytes.push(noteQuant >> 8 & 0xff);
    }
  } else {
    bytes.push(inst);
  }

  /*
  // TODO process "dots"
  if (command.length) {
    res.noteLen = framesFrom(command.length, state.tempo);
    res.noteQuant = Math.round(res.noteLen * (state.quant / 8));
  } else {
    res.noteLen = state.noteFrames;
    res.noteQuant = state.quantFrames;
  }
  */

  return bytes;
}

function channelNumFromName(name) {
  let n;
  if (name === 'A') { n = 0; }
  if (name === 'B') { n = 1; }
  if (name === 'C') { n = 2; }
  return n;
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
      headers[name] = defaultHeaderField;
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
    states[i] = Object.assign({}, defaultChannelState);
    states[i].noteFrames = framesFrom(states[i].noteLength, states[i].tempo);
    states[i].quantFrames = Math.round(states[i].noteFrames *
      (states[i].quant / 8));
  }
  return states;
}

function buildSongTables(ast, initialStates) {
  let songs = [], states = [];

  // create tables
  for (let i = 0; i < 3; i++) {
    songs[i]  = [];
    states[i] = Object.assign(initialStates[i]);
  }

  for (let elem of ast.body) {
    if (elem.type === 'command') {
      for (let channel of elem.channels) {
        let i = channelNumFromName(channel);
        let state = states[i];

        for (let cmd of elem.sequence) {
          switch (cmd.type) {
            case 'note':
            case 'rest':
              for (let b of bytesFromNoteCommand(cmd, state)) {
                songs[i].push(b);
              }
              break;
            case 'set_tempo':
              state.tempo = cmd.value;
              break;
            case 'set_note_length':
              state.noteLength = cmd.value;
              break;
            case 'set_octave':
              songs[i].push('I_OCTAVE');
              break;
            case 'set_quantize':
              state.quant = cmd.value;
              break;
            case 'inc_octave':
              songs[i].push('I_OCT_INC');
              break;
            case 'dec_octave':
              songs[i].push('I_OCT_DEC');
              break;
            default:
              console.error(`Command not implemented yet: ${cmd}`);
          }

          // Update lower-level state variables (frames)
          state.noteFrames = framesFrom(state.noteLength, state.tempo);
          state.quantFrames = Math.round(state.noteFrames *
            (state.quant / 8));

          //console.log(`${cmd.type} -- noteFrames <- ${state.noteFrames},` +
          //  `quantFrames <- ${state.quantFrames}`);
        }
      }
    }
  }

  for (let i = 0; i < 3; i++) {
    songs[i].push(0xff);
  }

  return songs;
}

function buildSequences(ast) {
  return {};
}


function compileAST(ast, options) {
  options = options || {};

  let data = { debug: options.debug };

  data.headers = buildHeaders(ast);

  let initialStates = buildInitialState(ast);
  data.initialStates = initialStates;

  data.sequences = buildSequences(ast);
  data.song = buildSongTables(ast, initialStates);

  let template;
  if (options.player) {
    template = prgTpl;
  } else {
    template = sidTpl;
  }

  return template(data);
}

exports.compile = function(source, options) {
  options = options || {};

  const ast = parse(source);
  const out = compileAST(ast, options);

  return out;
}
