export class AdminView {
  constructor(sessionModel) {
    this.sessionModel = sessionModel;
    document.querySelectorAll('[data-tab="admin"]').forEach((btn) => {
      btn.onclick = () => this.render();
    });
  }

  async render() {
    if (window.setActiveTab) window.setActiveTab("admin");
    const allUsers = await this.sessionModel.getAllUsers();
    const users = allUsers.filter((u) => !u.isAnonymous);
    const mc = document.querySelector("#main-container");

    mc.innerHTML = `
      <div class="d-flex flex-column align-items-center py-4 w-100">
        <div class="rounded-4 shadow-sm px-4 py-3 text-center mb-4 w-100 lexis-prompt-bar lexis-contained">
          User Management
        </div>
        <div class="table-responsive lexis-contained w-100">
          <table class="table table-sm lexis-text-p">
            <thead>
              <tr>
                <th>Name</th>
                <th>Lv</th>
                <th>Title</th>
                <th>XP</th>
                <th>Coins</th>
                <th>Streak</th>
                <th>Sheets</th>
                <th>HC Best</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${users
                .map(
                  (u) => `<tr>
                <td>${u.name}</td>
                <td>${u.level}</td>
                <td>${u.currentTitle}</td>
                <td><span class="admin-editable cursor-pointer" data-user="${u.id}" data-field="xp">${u.xp}</span></td>
                <td><span class="admin-editable cursor-pointer" data-user="${u.id}" data-field="coins">${u.coins}</span></td>
                <td>${u.streak}</td>
                <td>${u.solvedSheets?.length ?? 0}</td>
                <td>${u.hardcoreBest ?? 0}</td>
                <td><button class="btn btn-sm btn-outline-danger rounded-pill px-2 py-0 admin-delete-btn" data-user="${u.id}" data-name="${u.name}">✕</button></td>
              </tr>`,
                )
                .join("")}
            </tbody>
          </table>
          ${users.length === 0 ? '<p class="text-center text-secondary py-3">No registered users yet.</p>' : ""}
        </div>
      </div>`;

    mc.querySelectorAll(".admin-editable").forEach((span) => {
      span.addEventListener("click", () => {
        if (span.querySelector("input")) return;
        const val = span.textContent;
        span.innerHTML = `<input type="number" class="form-control form-control-sm d-inline-block" style="width:5rem" value="${val}" />`;
        const input = span.querySelector("input");
        input.focus();
        input.select();
        const save = async () => {
          const newVal = parseInt(input.value);
          if (!isNaN(newVal)) {
            await this.sessionModel.updateUserStat(
              span.dataset.user,
              span.dataset.field,
              newVal,
            );
            span.textContent = newVal;
          } else {
            span.textContent = val;
          }
        };
        input.addEventListener("blur", save);
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            input.blur();
          }
        });
      });
    });

    mc.querySelectorAll(".admin-delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (confirm(`Delete user "${btn.dataset.name}"?`)) {
          await this.sessionModel.deleteUser(btn.dataset.user);
          this.render();
        }
      });
    });
  }
}
