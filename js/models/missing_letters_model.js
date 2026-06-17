export default class MissingLettersModel {
  constructor(data) {
    this.word = data.word;
    this.hint = data.hint || "";
    this.blanks = this._selectBlanks();
    this.completed = false;
  }

  _selectBlanks() {
    const len = this.word.length;
    const count = Math.min(2, Math.max(1, Math.floor(len / 5)));
    const indices = new Set();
    while (indices.size < count) {
      const idx = Math.floor(Math.random() * len);
      if (idx !== 0 && idx !== len - 1) indices.add(idx);
    }
    return Array.from(indices).sort((a, b) => a - b);
  }

  getDisplayWord() {
    // return string with underscores for blanks
    const chars = this.word.split("");
    this.blanks.forEach((i) => (chars[i] = "_"));
    return chars.join("");
  }

  checkAnswers(inputs) {
    const correct = this.blanks.every(
      (idx, i) => inputs[i].toLowerCase() === this.word[idx].toLowerCase(),
    );
    this.completed = correct;
    return correct;
  }
}
