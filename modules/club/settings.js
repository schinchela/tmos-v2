import { apiRequest } from "../../assets/js/api.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
  `;
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

async function loadSettings() {
  const select = document.getElementById("officerTermCycle");
  const message = document.getElementById("clubSettingsMessage");

  message.textContent = "Loading settings...";

  try {
    const response = await apiRequest("/api/club/settings");
    const settings = response.data || {};

    select.value = settings.officer_term_cycle || "YEARLY";

    updatePreview();
    message.textContent = "";
  } catch (error) {
    message.textContent = `Failed to load settings: ${escapeHtml(error.message)}`;
  }
}

export async function initClubSettings() {
  const form = document.getElementById("clubSettingsForm");
  const select = document.getElementById("officerTermCycle");
  const button = document.getElementById("saveClubSettingsBtn");
  const message = document.getElementById("clubSettingsMessage");

  select?.addEventListener("change", updatePreview);

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "Saving settings...";
    button.disabled = true;

    try {
      await apiRequest("/api/club/settings", {
        method: "PUT",
        body: {
          officerTermCycle: select.value
        }
      });

      updatePreview();
      message.textContent = "Settings saved successfully.";
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  await loadSettings();
}
