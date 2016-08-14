const State = require('./state');
const sidTpl = require('./player/sid');
const prgTpl = require('./player/prg');
const debug = require('debug')('code_generator');

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

  _pushSequence(sequence, i, song, state, lastState) {
    for (let cmd of sequence) {
      debug(`#${i} cmd: ${JSON.stringify(cmd)}`);

      switch (cmd.type) {
        case 'note':
        case 'rest': {
          // push commands to change from lastState to state
          let changes = this._changesFrom(state, lastState);
          debug(`#${i} changes: ${JSON.stringify(changes, null, 4)}`);

          // update lastState
          Object.assign(lastState, state);

          // push commands based on changes
          if (changes.noteLength || changes.noteLengthFrames) {
            song.push('I_NLEN', state.noteLengthFrames - 1);
          }
          if (changes.quantLength || changes.quantLengthFrames) {
            song.push('I_QLEN', state.quantLengthFrames - 1);
          }

          // increment borrow
          state.borrow += state.borrowFrames;
          debug(`#${i} borrow = ${state.borrow}`);

          // append notes
          for (let b of this._bytesFromNoteCommand(cmd, state)) {
            song.push(b);
          }

          break;
        }
        case 'set_tempo':
          state.tempo = cmd.value;
          break;
        case 'set_note_length':
          state.noteLength = cmd.value;
          break;
        case 'set_quantize':
          state.quantLength = cmd.value;
          break;
        case 'set_octave':
          song.push('I_OCTAVE', cmd.value);
          break;
        case 'inc_octave':
          song.push('I_OCT_INC');
          break;
        case 'dec_octave':
          song.push('I_OCT_DEC');
          break;
        case 'transpose': {
          let value = cmd.value & 0xff;
          if (value < 0) {
            value = (0xff + data8 + 1);
          }
          song.push('I_TRANSPOSE', value);
          break;
        }
        case 'set_volume':
          song.push('I_VOLUME', cmd.value);
          break;
        case 'inc_volume':
          if (cmd.value) {
            console.error('Warning: inc_volume argument is ignored by player');
          }
          song.push('I_VOL_INC');
          break;
        case 'dec_volume':
          if (cmd.value) {
            console.error('Warning: dec_volume argument is ignored by player');
          }
          song.push('I_VOL_DEC');
          break;
        case 'loop':
          song.push('I_LOOP_STR', cmd.times);
          this._pushSequence(cmd.body, i, song, state, lastState);
          song.push('I_LOOP_END');
          break;
        default:
          console.error(`Command not implemented yet: ${cmd.type}`);
      }
    }
  }

  _buildSongTables(initialStates) {
    let songs = [], states = [], lastStates = [];

    // create tables
    for (let i = 0; i < 3; i++) {
      songs.push([]);
      states.push(new State(initialStates[i]));
      // lastState stores the state before the last *note command*
      lastStates.push(new State(states[i]));
    }

    debug(`initialStates: ${JSON.stringify(lastStates, null, 4)}`);

    for (let elem of this.document.commands) {
      for (let channel of elem.channels) {
        let i = this._channelNumFromName(channel);
        this._pushSequence(elem.sequence, i, songs[i], states[i], lastStates[i]);
      }
    }

    for (let i = 0; i < 3; i++) {
      songs[i].push('I_EOF');
    }

    return songs;
  }

  _changesFrom(state, lastState) {
    let changes = {};

    for (let k in state) {
      if (state[k] !== lastState[k]) {
        changes[k] = state[k];
      }
    }

    if (state.noteLengthFrames !== lastState.noteLengthFrames) {
      changes.noteLengthFrames = state.noteLengthFrames;
    }
    if (state.quantLengthFrames !== lastState.quantLengthFrames) {
      changes.quantLengthFrames = state.quantLengthFrames;
    }

    return changes;
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

    // Create a modified state based on custom note length from command
    // (if available)
    let modState = Object.assign(state, {
      noteLength: command.length || state.noteLength
    });

    let noteLen = modState.noteLengthFrames;

    // Add frames "borrow" from previous notes to compensate
    if (state.borrow >= 1) {
      state.borrow -= 1;
      noteLen += 1;
      debug(`state.borrow >= 1, so increment noteLen to ${noteLen}`);
    } else if (state.borrow <= -1) {
      state.borrow += 1;
      noteLen -= 1;
      debug(`state.borrow <= -1, so decrement noteLen to ${noteLen}`);
    }

    // TODO process "dots"
    // ...

    // If note length differs from current default note length, append note
    // length and quantization length bytes
    if (noteLen !== state.noteLengthFrames) {
      let noteQuant = modState.quantLengthFrames;

      // FIXME WITH_Q_FLAG does not work on player routine!

      //inst = inst + '|WITH_LEN_FLAG|WITH_Q_FLAG';
      inst = inst + '|WITH_LEN_FLAG';
      if (noteLen > 0xff) {
        inst += '|WORD_FLAG';
      }

      // decrement because player routine requires note length to be n-1
      noteQuant -= 1;
      noteLen -= 1;

      // push note command instruction and operands
      bytes.push(inst);
      bytes.push(noteLen & 0xff);
      if (noteLen > 0xff) {
        bytes.push((noteLen >> 8) & 0xff);
      }
      //bytes.push(noteQuant & 0xff);
      //if (noteQuant > 0xff) {
        //bytes.push((noteQuant >> 8) & 0xff);
      //}
    } else {
      bytes.push(inst);
    }

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
