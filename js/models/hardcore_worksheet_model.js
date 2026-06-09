import WorksheetModel from "./worksheet_model.js";
import { WORDS, SENTENCES } from "../data.js";

const EXERCISE_TYPES = ["spelling", "letter_dnd", "missing", "word_order", "letter_reversal", "visual_discrimination"];

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function randomSentence() {
  return SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
}

function generateExercise() {
  const type = EXERCISE_TYPES[Math.floor(Math.random() * EXERCISE_TYPES.length)];
  switch (type) {
    case "spelling": { const w = randomWord(); return { type, data: { word: w.word, hint: w.hint } }; }
    case "letter_dnd": { const w = randomWord(); return { type, data: { word: w.word, hint: w.hint } }; }
    case "missing": { const w = randomWord(); return { type, data: { word: w.word, hint: w.hint } }; }
    case "word_order": { const s = randomSentence(); return { type, data: { sentence: s.sentence, hint: s.hint } }; }
    case "letter_reversal": { const w = randomWord(); return { type, data: { word: w.word, hint: w.hint } }; }
    case "visual_discrimination": { const w = randomWord(); return { type, data: { word: w.word, hint: w.hint } }; }
  }
}

export default class HardcoreWorksheetModel extends WorksheetModel {
  static COIN_REWARD = 1;
  constructor(sessionModel) {
    super([generateExercise()], "hardcore", sessionModel);
    this.hardcore = true;
  }

  nextExercise() {
    const next = generateExercise();
    this.exercises.push(next);
    this.currentIndex++;
    return this.getCurrentExercise();
  }

  async _persistProgress() {
    const user = await this.sessionModel?.getSession();
    if (!user) return;
    user.coins += HardcoreWorksheetModel.COIN_REWARD;
    await this.sessionModel.updateUser(user);
    await this._dispatchStreak();
  }
}
