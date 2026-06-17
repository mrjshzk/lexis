import { shuffle } from "../utils.js";

export default class WordOrderModel {
  constructor(data) {
    this.original = data.sentence.trim();
    this.hint = data.hint || "";
    this.words = this.original.split(/\s+/);
    this.shuffled = shuffle(this.words);
    this.completed = false;
  }

  checkAnswer(selected) {
    const isCorrect = selected.join(" ") === this.original;
    this.completed = isCorrect;
    return isCorrect;
  }
}
