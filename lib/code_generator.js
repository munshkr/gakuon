const sidTpl = require('./player/sid');
const prgTpl = require('./player/prg');

const defaultHeaderField = 'unknown';

const headerNames = ['title', 'author', 'released'];

class CodeGenerator {
  constructor(document, options) {
    if (typeof(document) === 'undefined') {
      throw new TypeError('document is required');
    }

    this.document = document;
    this.options = options || {};
  }

  generate() {
    let initialStates = this.document.initialState;

    let data = {
      debug: this.options.debug,
      headers: this._buildHeaders(),
      initialStates: initialStates,
      sequences: this._buildSequences(),
      song: this._buildSongTables(initialStates)
    };

    return this._template(data);
  }

  _buildHeaders() {
    let headers = {};

    for (let dir in this.document.directives) {
      if (headerNames.includes(dir)) {
        let value = this.document.directives[dir].trim();
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
      headers[name] = this._padRight(headers[name], 32);
    }

    return headers;
  }

  _buildSongTables(initialStates) {
    let songs = [], states = [];

    // create tables
    for (let i = 0; i < 3; i++) {
      songs[i]  = [];
      states[i] = Object.assign(initialStates[i]);
    }

    for (let elem of this.document.commands) {
      for (let channel of elem.channels) {
        let i = this._channelNumFromName(channel);
        let state = states[i];

        for (let cmd of elem.sequence) {
          console.log(cmd);

          switch (cmd.type) {
            case 'note':
            case 'rest':
              for (let b of this._bytesFromNoteCommand(cmd, state)) {
                songs[i].push(b);
              }
              break;
            case 'set_tempo':
              state.tempo = cmd.value;
              break;
            case 'set_note_length': {
              let oldNF = state.noteLengthFrames;
              let oldQF = state.quantLengthFrames;

              state.noteLength = cmd.value;

              let newNF = state.noteLengthFrames;
              let newQF = state.quantLengthFrames;

              if (newNF !== oldNF) {
                songs[i].push('I_NLEN', newNF-1);
              }
              if (newQF !== oldQF) {
                songs[i].push('I_QLEN', newQF-1);
              }
              break;
            }
            case 'set_octave':
              songs[i].push('I_OCTAVE', cmd.value);
              break;
            case 'set_quantize': {
              let oldQF = state.quantLengthFrames;

              state.quantLength = cmd.value;

              let newQF = state.quantLengthFrames;

              if (newQF !== oldQF) {
                songs[i].push('I_QLEN', newQF-1);
              }
              break;
            }
            case 'set_quantize_frames': {
              state.quantLength = cmd.value;
              let noteFrames = state.noteLengthFrames;
              let frames = cmd.value <= noteFrames ? cmd.value : noteFrames;
              songs[i].push('I_QLEN', frames);
              break;
            }
            case 'inc_octave':
              songs[i].push('I_OCT_INC');
              break;
            case 'dec_octave':
              songs[i].push('I_OCT_DEC');
              break;
            default:
              console.error(`Command not implemented yet: ${cmd}`);
          }
        }
      }
    }

    for (let i = 0; i < 3; i++) {
      songs[i].push('I_EOF');
    }

    return songs;
  }

  _buildSequences() {
    // TODO
    return {};
  }

  _channelNumFromName(name) {
    let n;
    if (name === 'A') { n = 0; }
    if (name === 'B') { n = 1; }
    if (name === 'C') { n = 2; }
    return n;
  }

  _bytesFromNoteCommand(command, state) {
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
      // Create a modified state based on custom note length from command
      let modState = Object.assign(state, { noteLength: command.length });

      let noteLen = modState.noteLengthFrames;
      let noteQuant = modState.quantLengthFrames;

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
      res.noteLen = this._framesFrom(command.length, state.tempo);
      res.noteQuant = Math.round(res.noteLen * (state.quant / 8));
    } else {
      res.noteLen = state.noteFrames;
      res.noteQuant = state.quantFrames;
    }
    */

    return bytes;
  }

  _template(data) {
    if (this.options.player) {
      return prgTpl(data);
    } else {
      return sidTpl(data);
    }
  }

  _padRight(str, len, char) {
    return str + Array(len - str.length + 1).join(char || ' ');
  }
}

module.exports = CodeGenerator;
