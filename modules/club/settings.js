import { apiRequest } from "../../assets/js/api.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function currentYear() {
  return new Date().getFullYear();
}

function generateTerms(year, cycle) {
  const selectedYear = Number(year);

  if (cycle === "HALF_YEARLY") {
    return [
      {
        termLabel: `July ${selectedYear} - December ${selectedYear}`,
        termCycle: "HALF_YEARLY",
        termStart: `${selectedYear}-07-01`,
        termEnd: `${selectedYear}-12-31`
      },
      {
        termLabel: `January ${selectedYear + 1} - June ${selectedYear + 1}`,
        termCycle: "HALF_YEARLY",
        termStart: `${selectedYear + 1}-01-01`,
        termEnd: `${selectedYear + 1}-06-30`
      }
    ];
  }

  return [
    {
      termLabel: `July ${selectedYear} - June ${selectedYear + 1}`,
      termCycle: "YEARLY",
      termStart: `${selectedYear}-07-01`,
      termEnd: `${selectedYear + 1}-06-30`
    }
  ];
}

function renderTermRows(terms) {
  if (!terms.length) {
    return `
      <tr>
        <td colspan="5">No officer terms created yet.</td>
      </tr>
    `;
  }

  return terms.map((term) => `
    <tr>
      <td><strong>${escapeHtml(term.term_label)}</strong></td>
      <td>${escapeHtml(term.term_cycle)}</td>
      <td>${escapeHtml(term.term_start)}</td>
      <td>${escapeHtml(term.term_end)}</td>
      <td>${escapeHtml(term.status || "ACTIVE")}</td>
    </tr>
  `).join("");
}

export function renderClubSettings() {
  return `
    <section class="hero">
      <p class="eyebrow">Administration</p>
      <h3>Club Settings</h3>
      <p>
        Configure club-level rules that affect officers, meetings, education tracking,
        reports and member history.
      </p>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Officer Term Cycle</h3>
        <span class="badge">Toastmasters Configuration</span>
      </div>

      <form class="enterprise-form" id="clubSettingsForm">
        <div class="form-grid">
          <label>
            Officer Term Cycle
            <select name="officerTermCycle" id="officerTermCycle">
              <option value="YEARLY">Yearly — July to June</option>
              <option value="HALF_YEARLY">Half-Yearly — July to December / January to June</option>
            </select>
          </label>
          <label>
          Regular Meeting Day
  <select name="regularMeetingDay" id="regularMeetingDay">
    <option value="">Not Set</option>
    <option value="0">Sunday</option>
    <option value="1">Monday</option>
    <option value="2">Tuesday</option>
    <option value="3">Wednesday</option>
    <option value="4">Thursday</option>
    <option value="5">Friday</option>
    <option value="6">Saturday</option>
  </select>
</label>

<label>
  Regular Meeting Time
  <input
    name="regularMeetingTime"
    id="regularMeetingTime"
    type="time"
  />
</label>
        </div>

        <div class="module-panel">
          <div class="panel-header">
            <h3>Generated Term Logic</h3>
          </div>

          <div class="enterprise-form">
            <p id="termCyclePreview">
              Yearly terms run from July of the selected year to June of the next year.
            </p>
          </div>
        </div>

        <button class="primary-btn" id="saveClubSettingsBtn" type="submit">
          Save Settings
        </button>

        <p class="form-message" id="clubSettingsMessage"></p>
      </form>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Generate Officer Terms</h3>
        <span class="badge">Leadership Tracking</span>
      </div>

      <form class="enterprise-form" id="generateTermsForm">
        <div class="form-grid">
          <label>
            Term Start Year
            <input
              id="termYear"
              name="termYear"
              type="number"
              min="2020"
              max="2100"
              value="${currentYear()}"
            />
          </label>

          <label>
            Cycle Used
            <select id="termCycleForGeneration" name="termCycleForGeneration">
              <option value="YEARLY">Yearly</option>
              <option value="HALF_YEARLY">Half-Yearly</option>
            </select>
          </label>
        </div>

        <div class="module-panel">
          <div class="panel-header">
            <h3>Preview</h3>
          </div>

          <div class="enterprise-form">
            <p id="termGenerationPreview">Select a year and cycle to preview officer terms.</p>
          </div>
        </div>

        <button class="primary-btn" id="generateTermsBtn" type="submit">
          Create Officer Terms
        </button>

        <p class="form-message" id="generateTermsMessage"></p>
      </form>
    </section>

    <section class="module-panel">
      <div class="panel-header">
        <h3>Officer Terms</h3>
        <button class="ghost-btn" id="refreshTermsBtn" type="button">Refresh</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Term</th>
            <th>Cycle</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="officerTermsTable">
          <tr>
            <td colspan="5">Loading officer terms...</td>
          </tr>
        </tbody>
      </table>
    </section>
 <section class="module-panel">
  <div class="panel-header">
    <h3>Meeting Configuration</h3>
  </div>

  <div class="grid">
    <article class="card config-card" data-config-type="MEETING_ROLE">
      <span>Meeting Roles</span>
      <strong>Manage Roles</strong>
    </article>

    <article class="card config-card" data-config-type="MEETING_AWARD">
      <span>Meeting Awards</span>
      <strong>Manage Awards</strong>
    </article>

    <article class="card config-card" data-config-type="MEETING_TYPE">
      <span>Meeting Types</span>
      <strong>Manage Meeting Types</strong>
    </article>
  </div>
</section>

<section
  id="configurationManager"
  class="module-panel"
  style="display:none;"
></section> `;
}

function updatePreview() {
  const select = document.getElementById("officerTermCycle");
  const preview = document.getElementById("termCyclePreview");

  if (!select || !preview) return;

  if (select.value === "HALF_YEARLY") {
    preview.textContent =
      "Half-yearly officer terms run from July to December and January to June.";
  } else {
    preview.textContent =
      "Yearly officer terms run from July of the selected year to June of the next year.";
  }
}

function updateGenerationPreview() {
  const yearInput = document.getElementById("termYear");
  const cycleInput = document.getElementById("termCycleForGeneration");
  const preview = document.getElementById("termGenerationPreview");

  if (!yearInput || !cycleInput || !preview) return;

  const terms = generateTerms(yearInput.value || currentYear(), cycleInput.value);

  preview.innerHTML = terms
    .map((term) => `
      <strong>${escapeHtml(term.termLabel)}</strong><br>
      <small>${escapeHtml(term.termStart)} to ${escapeHtml(term.termEnd)}</small>
    `)
    .join("<br><br>");
}

async function loadSettings() {
  const select = document.getElementById("officerTermCycle");
  const generationCycle = document.getElementById("termCycleForGeneration");
  const message = document.getElementById("clubSettingsMessage");

  message.textContent = "Loading settings...";

  try {
    const response = await apiRequest("/api/club/settings");
    const settings = response.data || {};

    select.value = settings.officer_term_cycle || "YEARLY";
    generationCycle.value = settings.officer_term_cycle || "YEARLY";
    document.getElementById("regularMeetingDay").value =
  settings.regular_meeting_day || "";

document.getElementById("regularMeetingTime").value =
  settings.regular_meeting_time || "";
    updatePreview();
    updateGenerationPreview();

    message.textContent = "";
  } catch (error) {
    message.textContent = `Failed to load settings: ${escapeHtml(error.message)}`;
  }
}

async function loadOfficerTerms() {
  const table = document.getElementById("officerTermsTable");

  table.innerHTML = `
    <tr>
      <td colspan="5">Loading officer terms...</td>
    </tr>
  `;

  try {
    const response = await apiRequest("/api/officer-terms");
    table.innerHTML = renderTermRows(response.data || []);
  } catch (error) {
    table.innerHTML = `
      <tr>
        <td colspan="5">Failed to load officer terms: ${escapeHtml(error.message)}</td>
      </tr>
    `;
  }
}

async function loadConfiguration(configType) {
  const container = document.getElementById("configurationManager");

  container.style.display = "block";

  container.innerHTML = `
    <div class="enterprise-form">
      Loading configuration...
    </div>
  `;

  try {
    const response = await apiRequest(`/api/configuration/${configType}`);
    const rows = response.data || [];

    const title = configType.replaceAll("_", " ");

    container.innerHTML = `
      <div class="panel-header">
        <h3>${escapeHtml(title)}</h3>
        <span class="badge">Club Customizable</span>
      </div>

      <div class="enterprise-form">
        <p>
          Choose which items your club uses and rename them if needed.
        </p>
      </div>

      <table class="table config-table">
        <thead>
          <tr>
            <th style="width:120px;">Enabled</th>
            <th>Name</th>
          </tr>
        </thead>

        <tbody>
          ${
            rows.length
              ? rows.map((row) => `
                <tr data-config-row="${escapeHtml(row.id)}">
                  <td>
                    <input
                      type="checkbox"
                      data-config-active
                      ${Number(row.is_active) === 1 ? "checked" : ""}
                    />
                  </td>

                  <td>
                    <input
                      data-config-name
                      value="${escapeHtml(row.config_name)}"
                    />
                  </td>
                </tr>
              `).join("")
              : `
                <tr>
                  <td colspan="2">No configuration items found.</td>
                </tr>
              `
          }
        </tbody>
      </table>

      <div class="top-actions" style="margin-top:16px;">
        <button
          class="primary-btn"
          id="saveConfigurationBtn"
          data-config-type="${escapeHtml(configType)}"
          type="button"
        >
          Save Changes
        </button>
      </div>

      <p class="form-message" id="configurationMessage"></p>
    `;

    bindConfigurationSaveButton(configType, rows);
  } catch (error) {
    container.innerHTML = `
      <div class="enterprise-form">
        Failed to load configuration: ${escapeHtml(error.message)}
      </div>
    `;
  }
}

function bindConfigurationSaveButton(configType, rows) {
  const saveButton = document.getElementById("saveConfigurationBtn");
  const message = document.getElementById("configurationMessage");

  saveButton?.addEventListener("click", async () => {
    const updateRows = [...document.querySelectorAll("[data-config-row]")];

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";
    message.textContent = "Saving configuration...";

    try {
      for (const rowElement of updateRows) {
        const configId = rowElement.dataset.configRow;
        const original = rows.find((row) => row.id === configId);

        await apiRequest(`/api/configuration/${configType}/${configId}`, {
          method: "PUT",
          body: {
            configName: rowElement.querySelector("[data-config-name]").value,
            configKey: original.config_key,
            isActive: rowElement.querySelector("[data-config-active]").checked,
            sortOrder: original.sort_order,
            configValue: JSON.parse(original.config_value_json || "{}")
          }
        });
      }

      message.textContent = "Configuration saved successfully.";
      await loadConfiguration(configType);
    } catch (error) {
      message.textContent = error.message;
      saveButton.disabled = false;
      saveButton.textContent = "Save Changes";
    }
  });
}

export async function initClubSettings() {
  const form = document.getElementById("clubSettingsForm");
  const select = document.getElementById("officerTermCycle");
  const button = document.getElementById("saveClubSettingsBtn");
  const message = document.getElementById("clubSettingsMessage");

  const generateForm = document.getElementById("generateTermsForm");
  const generateButton = document.getElementById("generateTermsBtn");
  const generateMessage = document.getElementById("generateTermsMessage");
  const yearInput = document.getElementById("termYear");
  const generationCycle = document.getElementById("termCycleForGeneration");
  const refreshTermsBtn = document.getElementById("refreshTermsBtn");
  document
  .querySelectorAll(".config-card")
  .forEach(card => {
    card.addEventListener("click", () => {
      loadConfiguration(
        card.dataset.configType
      );
    });
  });
  select?.addEventListener("change", () => {
    updatePreview();
    generationCycle.value = select.value;
    updateGenerationPreview();
  });

  yearInput?.addEventListener("input", updateGenerationPreview);
  generationCycle?.addEventListener("change", updateGenerationPreview);
  refreshTermsBtn?.addEventListener("click", loadOfficerTerms);

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "Saving settings...";
    button.disabled = true;

    try {
      await apiRequest("/api/club/settings", {
        method: "PUT",
        body: {
  officerTermCycle: select.value,
  regularMeetingDay: document.getElementById("regularMeetingDay").value,
  regularMeetingTime: document.getElementById("regularMeetingTime").value
}
      });

      updatePreview();
      updateGenerationPreview();
      message.textContent = "Settings saved successfully.";
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  generateForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const terms = generateTerms(yearInput.value || currentYear(), generationCycle.value);

    generateMessage.textContent = "Creating officer terms...";
    generateButton.disabled = true;

    try {
      for (const term of terms) {
        await apiRequest("/api/officer-terms", {
          method: "POST",
          body: term
        });
      }

      generateMessage.textContent = "Officer terms created successfully.";
      await loadOfficerTerms();
    } catch (error) {
      generateMessage.textContent = error.message;
    } finally {
      generateButton.disabled = false;
    }
  });

  await loadSettings();
  await loadOfficerTerms();
}
