import { StorageService } from "./StorageService.js";
import { Worksheet, EXERCISE_TYPES } from "../models/Worksheet.js";

const DEFAULT_WORKSHEETS = [
  {
    id: "ws-1",
    title: "Ficha 1 — Vogais",
    description: "Identifica e reconhece as vogais da língua portuguesa.",
    xpReward: 50,
    requiredXP: 0,
    icon: "fa-solid fa-font",
    exercises: [
      {
        id: "ex-1-1",
        type: EXERCISE_TYPES.MULTIPLE_CHOICE,
        question: "Qual destas letras é uma vogal?",
        options: ["B", "A", "C", "D"],
        correctAnswer: "A",
      },
      {
        id: "ex-1-2",
        type: EXERCISE_TYPES.MULTIPLE_CHOICE,
        question: "Qual destas palavras tem mais vogais?",
        options: ["GATO", "BOCA", "CÃO", "PRAIA"],
        correctAnswer: "PRAIA",
      },
      {
        id: "ex-1-3",
        type: EXERCISE_TYPES.WORD_SCRAMBLE,
        question: "Ordena as letras para formar uma palavra: C, A, S, A",
        options: ["ASAC", "CASA", "SACA", "ACAS"],
        correctAnswer: "CASA",
      },
    ],
  },
  {
    id: "ws-2",
    title: "Ficha 2 — Sílabas",
    description: "Aprende a dividir palavras em sílabas.",
    xpReward: 75,
    requiredXP: 50,
    icon: "fa-solid fa-spell-check",
    exercises: [
      {
        id: "ex-2-1",
        type: EXERCISE_TYPES.MULTIPLE_CHOICE,
        question: "Como se divide a palavra «GATO» em sílabas?",
        options: ["GA-TO", "G-ATO", "GAT-O", "G-A-T-O"],
        correctAnswer: "GA-TO",
      },
      {
        id: "ex-2-2",
        type: EXERCISE_TYPES.MULTIPLE_CHOICE,
        question: "Quantas sílabas tem a palavra «BORBOLETA»?",
        options: ["2", "3", "4", "5"],
        correctAnswer: "4",
      },
      {
        id: "ex-2-3",
        type: EXERCISE_TYPES.WORD_SCRAMBLE,
        question: "Ordena as letras para formar uma palavra: A, T, O, G",
        options: ["TAGO", "GATO", "OTAG", "GOTA"],
        correctAnswer: "GATO",
      },
    ],
  },
  {
    id: "ws-3",
    title: "Ficha 3 — Palavras do Dia",
    description: "Pratica com palavras do quotidiano.",
    xpReward: 100,
    requiredXP: 125,
    icon: "fa-solid fa-book-open",
    exercises: [
      {
        id: "ex-3-1",
        type: EXERCISE_TYPES.MULTIPLE_CHOICE,
        question: "Qual é o animal que late?",
        options: ["GATO", "CÃO", "PATO", "VACA"],
        correctAnswer: "CÃO",
      },
      {
        id: "ex-3-2",
        type: EXERCISE_TYPES.WORD_SCRAMBLE,
        question: "Ordena as letras para formar o animal que mia: T, A, O, G",
        options: ["TAGO", "GATO", "ATOG", "GOTA"],
        correctAnswer: "GATO",
      },
      {
        id: "ex-3-3",
        type: EXERCISE_TYPES.MULTIPLE_CHOICE,
        question: "Qual destas palavras é um fruto?",
        options: ["MESA", "MAÇÃ", "CARRO", "PORTA"],
        correctAnswer: "MAÇÃ",
      },
    ],
  },
  {
    id: "ws-4",
    title: "Ficha 4 — Rimas",
    description: "Descobre palavras que rimam entre si.",
    xpReward: 125,
    requiredXP: 225,
    icon: "fa-solid fa-music",
    exercises: [
      {
        id: "ex-4-1",
        type: EXERCISE_TYPES.MULTIPLE_CHOICE,
        question: "Qual destas palavras rima com «PATO»?",
        options: ["CASA", "GATO", "BOLA", "CHUVA"],
        correctAnswer: "GATO",
      },
      {
        id: "ex-4-2",
        type: EXERCISE_TYPES.MULTIPLE_CHOICE,
        question: "Qual destas palavras rima com «FLOR»?",
        options: ["CÃO", "DOR", "PATO", "MESA"],
        correctAnswer: "DOR",
      },
      {
        id: "ex-4-3",
        type: EXERCISE_TYPES.WORD_SCRAMBLE,
        question: "Ordena as letras para formar uma palavra que rima com «BOLO»: L, O, V, O",
        options: ["OVOL", "VOLO", "OLVO", "LOVÔ"],
        correctAnswer: "VOLO",
      },
    ],
  },
];

export class WorksheetService {
  static initialize() {
    const existing = StorageService.getWorksheets();
    if (existing.length === 0) {
      StorageService.saveWorksheets(DEFAULT_WORKSHEETS);
    }
  }

  static getAll() {
    return StorageService.getWorksheets().map((w) => new Worksheet(w));
  }

  static getById(id) {
    const data = StorageService.getWorksheets().find((w) => w.id === id);
    return data ? new Worksheet(data) : null;
  }
}
