import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export class PdfModel {
  constructor(sessionModel) {
    this.sessionModel = sessionModel;
  }

  async getPdf() {
    const user = await this.sessionModel.getSession();
    return user?.pdf || null;
  }

  async parseAndSave(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

    let text = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n\n";
    }
    text = text.trim();

    const user = this.sessionModel.getSession();
    if (user) {
      user.pdf = { text, name: file.name };
      await this.sessionModel.updateUser(user);
    }

    return { text, name: file.name };
  }

  async clearPdf() {
    const user = await this.sessionModel.getSession();
    if (user) {
      delete user.pdf;
      await this.sessionModel.updateUser(user);
    }
  }
}
