import { apiRequest } from "../../assets/js/api.js";
let configurationRows = [];
let configurationRoles = [];
let editingAwardId = null;
let addingAward = false;
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
<label>
  Default Meeting Mode
  <select name="defaultMeetingMode" id="defaultMeetingMode">
    <option value="PHYSICAL">Physical</option>
    <option value="ONLINE">Online</option>
    <option value="HYBRID">Hybrid</option>
  </select>
</label>

<label>
  Default Venue
  <input
    name="defaultVenue"
    id="defaultVenue"
    placeholder="Club meeting venue"
  />
</label>

<label>
  Default Online Link
  <input
    name="defaultOnlineLink"
    id="defaultOnlineLink"
    placeholder="Zoom / Google Meet link"
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

    document.getElementById("defaultMeetingMode").value =
      settings.default_meeting_mode || "PHYSICAL";

    document.getElementById("defaultVenue").value =
      settings.default_venue || "";

    document.getElementById("defaultOnlineLink").value =
      settings.default_online_link || "";

    updatePreview();
    updateGenerationPreview();

    message.textContent = "";
  } catch (error) {
    message.textContent =
      `Failed to load settings: ${escapeHtml(error.message)}`;
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
    <div class="enterprise-form">Loading configuration...</div>
  `;

  try {
    const response = await apiRequest(`/api/configuration/${configType}`);
    configurationRows = response.data || [];

    if (configType === "MEETING_AWARD") {
      const rolesResponse = await apiRequest("/api/configuration/MEETING_ROLE");
      configurationRoles = rolesResponse.data || [];

      container.innerHTML = renderAwardsConfiguration();
      bindAwardsConfigurationEvents();
      return;
    }

    container.innerHTML = renderGenericConfiguration(configType, configurationRows);
  } catch (error) {
    container.innerHTML = `
      <div class="enterprise-form">
        Failed to load configuration: ${escapeHtml(error.message)}
      </div>
    `;
  }
}

function parseConfigValue(row) {
  try {
    return JSON.parse(row.config_value_json || "{}");
  } catch (_) {
    return {};
  }
}

function awardKeyFromName(name) {
  return String(name || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

function sourceLabel(source) {
  if (source === "SPEECHES") return "Prepared Speakers";
  if (source === "ROLES") return "Allowed Roles";
  if (source === "TABLE_TOPICS") return "Table Topics Participants";
  return "-";
}

function renderAllowedRolesSummary(configValue) {
  if (configValue.candidateSource !== "ROLES") {
    return "-";
  }

  const allowed = configValue.allowedRoleCodes || [];

  if (!allowed.length) {
    return "No roles selected";
  }

  return allowed
    .map((code) => {
      const role = configurationRoles.find((item) => item.config_key === code);
      return role?.config_name || code;
    })
    .join(", ");
}

function renderRoleCheckboxes(selectedCodes, prefix) {
  const selected = new Set(selectedCodes || []);

  return `
    <div class="checkbox-grid">
      ${configurationRoles
        .filter((role) => Number(role.is_active) === 1)
        .map((role) => `
          <label class="checkbox-row">
            <input
              type="checkbox"
              data-award-role="${escapeHtml(prefix)}"
              value="${escapeHtml(role.config_key)}"
              ${selected.has(role.config_key) ? "checked" : ""}
            />
            <span>${escapeHtml(role.config_name)}</span>
          </label>
        `)
        .join("")}
    </div>
  `;
}

function renderAwardEditor(row) {
  const configValue = parseConfigValue(row);
  const source = configValue.candidateSource || "ROLES";
  const allowedRoleCodes = configValue.allowedRoleCodes || [];

  return `
    <tr>
      <td colspan="5">
        <div class="enterprise-form">
          <div class="form-grid">
            <label>
              Award Name
              <input
                id="editAwardName_${escapeHtml(row.id)}"
                value="${escapeHtml(row.config_name)}"
              />
            </label>

            <label>
              Candidate Source
              <select id="editAwardSource_${escapeHtml(row.id)}">
                <option value="SPEECHES" ${source === "SPEECHES" ? "selected" : ""}>
                  Prepared Speakers
                </option>
                <option value="ROLES" ${source === "ROLES" ? "selected" : ""}>
                  Allowed Roles
                </option>
                <option value="TABLE_TOPICS" ${source === "TABLE_TOPICS" ? "selected" : ""}>
                  Table Topics Participants
                </option>
              </select>
            </label>

            <label>
              Enabled
              <select id="editAwardActive_${escapeHtml(row.id)}">
                <option value="1" ${Number(row.is_active) === 1 ? "selected" : ""}>Enabled</option>
                <option value="0" ${Number(row.is_active) === 0 ? "selected" : ""}>Disabled</option>
              </select>
            </label>
          </div>

          <div class="module-panel">
            <div class="panel-header">
              <h3>Allowed Roles</h3>
            </div>
            ${renderRoleCheckboxes(allowedRoleCodes, row.id)}
          </div>

          <button
            class="primary-btn"
            data-save-award="${escapeHtml(row.id)}"
            type="button"
          >
            Save
          </button>

          <button
            class="ghost-btn"
            data-cancel-award-edit
            type="button"
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  `;
}

function renderAddAwardForm() {
  if (!addingAward) return "";

  return `
    <section class="module-panel">
      <div class="panel-header">
        <h3>Add New Award</h3>
      </div>

      <div class="enterprise-form">
        <div class="form-grid">
          <label>
            Award Name
            <input id="newAwardName" placeholder="Example: Best Role Player" />
          </label>

          <label>
            Candidate Source
            <select id="newAwardSource">
              <option value="SPEECHES">Prepared Speakers</option>
              <option value="ROLES">Allowed Roles</option>
              <option value="TABLE_TOPICS">Table Topics Participants</option>
            </select>
          </label>
        </div>

        <div class="module-panel">
          <div class="panel-header">
            <h3>Allowed Roles</h3>
          </div>
          ${renderRoleCheckboxes([], "new")}
        </div>

        <button class="primary-btn" id="createAwardBtn" type="button">
          Create Award
        </button>

        <button class="ghost-btn" id="cancelCreateAwardBtn" type="button">
          Cancel
        </button>

        <p class="form-message" id="awardConfigMessage"></p>
      </div>
    </section>
  `;
}

function renderAwardsConfiguration() {
  return `
    <div class="panel-header">
      <h3>Awards Configuration</h3>
      <button class="ghost-btn" id="backToMeetingConfiguration" type="button">
        Back
      </button>
    </div>

    <div class="enterprise-form">
      <button class="primary-btn" id="showAddAwardBtn" type="button">
        Add New Award
      </button>
      <p class="form-message" id="awardConfigMessage"></p>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Award</th>
          <th>Candidate Source</th>
          <th>Allowed Roles</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        ${
          configurationRows.length
            ? configurationRows.map((row) => {
                const configValue = parseConfigValue(row);

                return `
                  <tr>
                    <td><strong>${escapeHtml(row.config_name)}</strong></td>
                    <td>${escapeHtml(sourceLabel(configValue.candidateSource))}</td>
                    <td>${escapeHtml(renderAllowedRolesSummary(configValue))}</td>
                    <td>${Number(row.is_active) === 1 ? "Enabled" : "Disabled"}</td>
                    <td>
                      <button
                        class="ghost-btn small-btn"
                        data-edit-award="${escapeHtml(row.id)}"
                        type="button"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                  ${editingAwardId === row.id ? renderAwardEditor(row) : ""}
                `;
              }).join("")
            : `
              <tr>
                <td colspan="5">No awards configured yet.</td>
              </tr>
            `
        }
      </tbody>
    </table>

    ${renderAddAwardForm()}
  `;
}

function renderGenericConfiguration(configType, rows) {
  return `
    <div class="panel-header">
      <h3>${escapeHtml(configType)}</h3>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Key</th>
          <th>Active</th>
          <th>Order</th>
        </tr>
      </thead>

      <tbody>
        ${
          rows.map((row) => `
            <tr>
              <td>${escapeHtml(row.config_name)}</td>
              <td>${escapeHtml(row.config_key)}</td>
              <td>${Number(row.is_active) === 1 ? "Yes" : "No"}</td>
              <td>${escapeHtml(row.sort_order)}</td>
            </tr>
          `).join("")
        }
      </tbody>
    </table>
  `;
}

function bindAwardsConfigurationEvents() {
  document.getElementById("backToMeetingConfiguration")?.addEventListener("click", () => {
    const container = document.getElementById("configurationManager");
    container.style.display = "none";
    container.innerHTML = "";
    editingAwardId = null;
    addingAward = false;
  });

  document.getElementById("showAddAwardBtn")?.addEventListener("click", () => {
    addingAward = true;
    editingAwardId = null;
    document.getElementById("configurationManager").innerHTML = renderAwardsConfiguration();
    bindAwardsConfigurationEvents();
  });

  document.querySelectorAll("[data-edit-award]").forEach((button) => {
    button.addEventListener("click", () => {
      editingAwardId = button.dataset.editAward;
      addingAward = false;
      document.getElementById("configurationManager").innerHTML = renderAwardsConfiguration();
      bindAwardsConfigurationEvents();
    });
  });

  document.querySelectorAll("[data-cancel-award-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      editingAwardId = null;
      document.getElementById("configurationManager").innerHTML = renderAwardsConfiguration();
      bindAwardsConfigurationEvents();
    });
  });

  document.querySelectorAll("[data-save-award]").forEach((button) => {
    button.addEventListener("click", async () => {
      const awardId = button.dataset.saveAward;
      const row = configurationRows.find((item) => item.id === awardId);
      const message = document.getElementById("awardConfigMessage");

      const name = document.getElementById(`editAwardName_${awardId}`).value.trim();
      const source = document.getElementById(`editAwardSource_${awardId}`).value;
      const isActive = document.getElementById(`editAwardActive_${awardId}`).value === "1";

      const allowedRoleCodes = [
        ...document.querySelectorAll(`[data-award-role="${awardId}"]:checked`)
      ].map((checkbox) => checkbox.value);

      if (!name) {
        message.textContent = "Award name is required.";
        return;
      }

      button.disabled = true;
      message.textContent = "Saving award...";

      try {
        await apiRequest(`/api/configuration/MEETING_AWARD/${awardId}`, {
          method: "PUT",
          body: {
            configName: name,
            configKey: row.config_key,
            configValue: {
              candidateSource: source,
              allowedRoleCodes: source === "ROLES" ? allowedRoleCodes : []
            },
            isActive,
            sortOrder: row.sort_order || 999
          }
        });

        editingAwardId = null;
        addingAward = false;
        await loadConfiguration("MEETING_AWARD");
      } catch (error) {
        message.textContent = error.message;
        button.disabled = false;
      }
    });
  });

  document.getElementById("cancelCreateAwardBtn")?.addEventListener("click", () => {
    addingAward = false;
    document.getElementById("configurationManager").innerHTML = renderAwardsConfiguration();
    bindAwardsConfigurationEvents();
  });

  document.getElementById("createAwardBtn")?.addEventListener("click", async () => {
    const message = document.getElementById("awardConfigMessage");
    const button = document.getElementById("createAwardBtn");

    const name = document.getElementById("newAwardName").value.trim();
    const source = document.getElementById("newAwardSource").value;

    const allowedRoleCodes = [
      ...document.querySelectorAll(`[data-award-role="new"]:checked`)
    ].map((checkbox) => checkbox.value);

    if (!name) {
      message.textContent = "Award name is required.";
      return;
    }

    button.disabled = true;
    message.textContent = "Creating award...";

    try {
      await apiRequest("/api/configuration/MEETING_AWARD", {
        method: "POST",
        body: {
          configGroup: "MEETINGS",
          configKey: awardKeyFromName(name),
          configName: name,
          configValue: {
            candidateSource: source,
            allowedRoleCodes: source === "ROLES" ? allowedRoleCodes : []
          },
          sortOrder: 999
        }
      });

      addingAward = false;
      editingAwardId = null;
      await loadConfiguration("MEETING_AWARD");
    } catch (error) {
      message.textContent = error.message;
      button.disabled = false;
    }
  });
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
  regularMeetingTime: document.getElementById("regularMeetingTime").value,
  defaultMeetingMode: document.getElementById("defaultMeetingMode").value,
  defaultVenue: document.getElementById("defaultVenue").value,
  defaultOnlineLink: document.getElementById("defaultOnlineLink").value
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
