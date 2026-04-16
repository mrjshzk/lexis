import { WorksheetService } from "../services/WorksheetService.js";

export class WorksheetController {
  #sessionController;
  #listeners = [];

  constructor(sessionController) {
    this.#sessionController = sessionController;
    WorksheetService.initialize();
  }

  getWorksheets() {
    const session = this.#sessionController.session;
    return WorksheetService.getAll().map((ws) => ({
      ...ws,
      isUnlocked: ws.isUnlocked(session.xp),
      isCompleted: session.hasCompletedWorksheet(ws.id),
    }));
  }

  getWorksheet(id) {
    return WorksheetService.getById(id);
  }

  completeWorksheet(worksheetId) {
    const worksheet = this.getWorksheet(worksheetId);
    if (!worksheet) return false;
    return this.#sessionController.completeWorksheet(worksheetId, worksheet.xpReward);
  }

  onChange(fn) {
    this.#listeners.push(fn);
    this.#sessionController.onChange(() => {
      this.#listeners.forEach((cb) => cb());
    });
  }
}
