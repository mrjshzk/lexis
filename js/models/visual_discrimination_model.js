import { shuffle } from "../utils.js";

const CONFUSABLE_PAIRS = [
  ["b", "d"],
  ["p", "q"],
  ["m", "w"],
  ["n", "h"],
  ["u", "n"],
  ["a", "o"],
  ["i", "l"],
  ["rn", "m"],
  ["cl", "d"],
];

function makeDistractor(word) {
  const strategies = [
    (w) => {
      for (let i = 0; i < w.length - 1; i++) {
        for (const [a, b] of CONFUSABLE_PAIRS) {
          if (w.slice(i, i + a.length).toLowerCase() === a) {
            return w.slice(0, i) + b + w.slice(i + a.length);
          }
          if (w.slice(i, i + b.length).toLowerCase() === b) {
            return w.slice(0, i) + a + w.slice(i + b.length);
          }
        }
      }
      return null;
    },
    (w) => {
      const adjacentPairs = [];
      for (let i = 0; i < w.length - 1; i++) {
        adjacentPairs.push([i, i + 1]);
      }
      if (adjacentPairs.length === 0) return null;
      const [a, b] =
        adjacentPairs[Math.floor(Math.random() * adjacentPairs.length)];
      const chars = w.split("");
      [chars[a], chars[b]] = [chars[b], chars[a]];
      return chars.join("");
    },
    (w) => {
      const idx = Math.floor(Math.random() * w.length);
      return w.slice(0, idx) + w.slice(idx + 1);
    },
    (w) => {
      const idx = Math.floor(Math.random() * (w.length + 1));
      const doubles = "aeioustlmnr";
      const ch = doubles[Math.floor(Math.random() * doubles.length)];
      return w.slice(0, idx) + ch + w.slice(idx);
    },
  ];

  shuffle(strategies);
  for (const fn of strategies) {
    const result = fn(word);
    if (
      result &&
      result !== word &&
      result.length >= 2 &&
      result.length <= word.length + 1
    ) {
      return result;
    }
  }
  return word + "s";
}

export default class VisualDiscriminationModel {
  constructor(data) {
    this.word = data.word;
    this.hint = data.hint || "";
    this.completed = false;
    this.options = this._generateOptions();
  }

  _generateOptions() {
    const correct = this.word;
    const optsSet = new Set([correct]);

    let attempts = 0;
    while (optsSet.size < 4 && attempts < 20) {
      const d = makeDistractor(correct);
      if (d !== correct) optsSet.add(d);
      attempts++;
    }

    const padding = ["word", "test", "text"];
    let pi = 0;
    while (optsSet.size < 4) {
      optsSet.add(correct + padding[pi]);
      pi++;
    }

    return shuffle(Array.from(optsSet));
  }

  checkAnswer(choice) {
    const isCorrect = choice === this.word;
    this.completed = isCorrect;
    return isCorrect;
  }
}
