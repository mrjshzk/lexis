export const EXERCISE_TYPES = Object.freeze({
  MULTIPLE_CHOICE: "multiple_choice",
  WORD_SCRAMBLE: "word_scramble",
});

export class Exercise {
  constructor({ id, type, question, options, correctAnswer }) {
    this.id = id ?? crypto.randomUUID();
    this.type = type;
    this.question = question;
    this.options = options ?? [];
    this.correctAnswer = correctAnswer;
  }
}

export class Worksheet {
  constructor({ id, title, description, xpReward, exercises, requiredXP, icon }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.xpReward = xpReward ?? 50;
    this.exercises = (exercises ?? []).map((e) => new Exercise(e));
    this.requiredXP = requiredXP ?? 0;
    this.icon = icon ?? "fa-solid fa-book";
  }

  isUnlocked(currentXP) {
    return currentXP >= this.requiredXP;
  }
}
