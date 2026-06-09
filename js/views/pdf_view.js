import { PdfModel } from "../models/pdf_model.js";

export class PdfView {
  constructor(sessionModel) {
    this.pdfModel = new PdfModel(sessionModel);
    document.querySelectorAll('[data-tab="pdf"]').forEach((btn) => {
      btn.onclick = () => this.render();
    });
  }

  async _renderContent() {
    const mc = document.querySelector("#main-container");
    const pdf = await this.pdfModel.getPdf();

    if (pdf) {
      mc.innerHTML = `
        <div class="d-flex flex-column align-items-center py-4 w-100">
          <div class="rounded-4 shadow-sm p-4 w-100 mb-4 lexis-card-wide">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h4 class="mb-0 lexis-text-p">📄 ${pdf.name}</h4>
              <button id="clear-pdf" class="btn btn-outline-danger rounded-pill btn-sm">Clear</button>
            </div>
            <div class="lexis-pdf-content">${pdf.text}</div>
          </div>
        </div>`;
      mc.querySelector("#clear-pdf").addEventListener("click", async () => {
        await this.pdfModel.clearPdf();
        this._renderContent();
      });
      return;
    }

    mc.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center w-100 lexis-min-h-full">
        <div class="rounded-4 shadow-sm px-4 py-3 text-center mb-4 w-100 lexis-prompt-bar lexis-contained">
          Read PDF files to earn coins!
        </div>
        <input type="file" id="pdf-input" accept="application/pdf" class="d-none" />
        <button id="upload-btn" class="btn text-white rounded-4 px-5 py-2 lexis-btn-upload">Click here to upload your file</button>
        <div id="pdf-status" class="mt-3"></div>
      </div>`;

    mc.querySelector("#upload-btn").addEventListener("click", () =>
      mc.querySelector("#pdf-input").click(),
    );
    mc.querySelector("#pdf-input").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const st = mc.querySelector("#pdf-status");
      st.innerHTML =
        '<div class="alert alert-info rounded-4 py-2 px-3">Parsing PDF…</div>';
      try {
        await this.pdfModel.parseAndSave(file);
        this._renderContent();
      } catch {
        st.innerHTML =
          '<div class="alert alert-danger rounded-4 py-2 px-3">Failed to read PDF.</div>';
      }
    });
  }

  async render() {
    if (window.setActiveTab) window.setActiveTab("pdf");
    await this._renderContent();
  }
}
