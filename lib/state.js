class State {
  constructor(state) {
    for (let k in state) {
      this[k] = state[k];
    }
  }

  get noteLengthFrames() {
    // 14400 ???
    return Math.round(14400 / this.noteLength / this.tempo);
  }

  get quantLengthFrames() {
    return Math.round(this.noteLengthFrames * (this.quantLength / 8));
  }
}

module.exports = State;
