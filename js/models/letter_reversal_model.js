import { shuffle } from "../utils.js";

const REVERSAL_PAIRS = {
  b: "d",
  d: "b",
  p: "q",
  q: "p",
  m: "w",
  w: "m",
};

export default class LetterReversalModel {
  constructor(data) {
    this.word = data.word;
    this.hint = data.hint || "";
    this.completed = false;
    this._setup();
  }

  _setup() {
    const candidates = [];
    for (let i = 0; i < this.word.length; i++) {
      const lower = this.word[i].toLowerCase();
      if (REVERSAL_PAIRS[lower]) {
        candidates.push(i);
      }
    }

    if (candidates.length === 0) {
      this.swappedIndex = 0;
      this.correctLetter = this.word[0];
      this.wrongLetter = REVERSAL_PAIRS[this.word[0].toLowerCase()] || "x";
      if (this.word[0] === this.word[0].toUpperCase()) {
        this.wrongLetter = this.wrongLetter.toUpperCase();
      }
    } else {
      this.swappedIndex =
        candidates[Math.floor(Math.random() * candidates.length)];
      this.correctLetter = this.word[this.swappedIndex];
      const lower = this.correctLetter.toLowerCase();
      const swapped = REVERSAL_PAIRS[lower];
      this.wrongLetter =
        this.correctLetter === this.correctLetter.toUpperCase()
          ? swapped.toUpperCase()
          : swapped;
    }

    const chars = this.word.split("");
    chars[this.swappedIndex] = this.wrongLetter;
    this.displayWord = chars.join("");
    this.options = this._generateOptions();
  }

  _generateOptions() {
    const correct = this.correctLetter;
    const opts = new Set([correct]);

    opts.add(this.wrongLetter);

    const pool = Object.values(REVERSAL_PAIRS);
    while (opts.size < 4) {
      const letter = pool[Math.floor(Math.random() * pool.length)];
      opts.add(letter);
    }

    return shuffle(Array.from(opts));
  }

  checkAnswer(positionIndex, choice) {
    const isCorrect =
      positionIndex === this.swappedIndex && choice === this.correctLetter;
    this.completed = isCorrect;
    return isCorrect;
  }
}
