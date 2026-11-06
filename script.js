const reportForm = document.getElementById("reportForm");
const trackForm = document.getElementById("trackForm");
const reportMessage = document.getElementById("reportMessage");
const trackResult = document.getElementById("trackResult");
const casesTable = document.getElementById("casesTable");
const STORAGE_KEY = "safereport_demo_cases";

function getCases() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch (error) { return []; }
}

function saveCases(cases) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

function makeReference() {
  return "SR-" + Math.floor(100000 + Math.random() * 900000);
}

function statusClass(status) {
  if (status === "Resolved") return "resolved";
  if (status === "Under Review") return "reviewing";
  return "submitted";
}

function renderCases() {
  const cases = getCases();
  if (!cases.length) {
    casesTable.innerHTML = '<tr><td colspan="5" class="empty-cell">No reports submitted yet.</td></tr>';
    return;
  }
  casesTable.innerHTML = cases.map(item => `
    <tr>
      <td><strong>${escapeHTML(item.reference)}</strong></td>
      <td>${escapeHTML(item.category)}</td>
      <td>${escapeHTML(item.date)}</td>
      <td><span class="pill ${statusClass(item.status)}">${escapeHTML(item.status)}</span></td>
      <td>
        <select aria-label="Update status for ${escapeHTML(item.reference)}" data-reference="${escapeHTML(item.reference)}">
          ${["Submitted", "Under Review", "Resolved"].map(status =>
            `<option ${item.status === status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
      </td>
    </tr>`).join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

reportForm.addEventListener("submit", function(event) {
  event.preventDefault();
  const item = {
    reference: makeReference(),
    category: document.getElementById("category").value,
    location: document.getElementById("location").value.trim(),
    date: document.getElementById("date").value,
    description: document.getElementById("description").value.trim(),
    contact: document.getElementById("contact").value.trim(),
    status: "Submitted"
  };

  if (!item.location || !item.description) {
    reportMessage.textContent = "Please complete the required fields.";
    return;
  }

  const cases = getCases();
  cases.unshift(item);
  saveCases(cases);
  reportMessage.textContent = "Demo report saved. Your reference number is " + item.reference + ". Keep it to track the case.";
  document.getElementById("reference").value = item.reference;
  reportForm.reset();
  renderCases();
  showCase(item);
});

trackForm.addEventListener("submit", function(event) {
  event.preventDefault();
  const reference = document.getElementById("reference").value.trim().toUpperCase();
  const item = getCases().find(entry => entry.reference.toUpperCase() === reference);
  if (!item) {
    trackResult.className = "track-result";
    trackResult.innerHTML = "<strong>No matching demo case found.</strong><p>Check the reference number and try again.</p>";
    return;
  }
  showCase(item);
});

function showCase(item) {
  trackResult.className = "track-result";
  trackResult.innerHTML = `
    <h3>Case ${escapeHTML(item.reference)}</h3>
    <p><strong>Category:</strong> ${escapeHTML(item.category)}</p>
    <p><strong>Date:</strong> ${escapeHTML(item.date)}</p>
    <p><strong>Status:</strong> <span class="pill ${statusClass(item.status)}">${escapeHTML(item.status)}</span></p>
    <p><strong>Description:</strong> ${escapeHTML(item.description)}</p>`;
}

casesTable.addEventListener("change", function(event) {
  if (!event.target.matches("select[data-reference]")) return;
  const reference = event.target.dataset.reference;
  const cases = getCases();
  const item = cases.find(entry => entry.reference === reference);
  if (!item) return;
  item.status = event.target.value;
  saveCases(cases);
  renderCases();
  const currentReference = document.getElementById("reference").value.trim().toUpperCase();
  if (currentReference === item.reference.toUpperCase()) showCase(item);
});

document.getElementById("clearDemo").addEventListener("click", function() {
  if (confirm("Clear all demonstration reports saved in this browser?")) {
    localStorage.removeItem(STORAGE_KEY);
    reportMessage.textContent = "Demo reports cleared.";
    trackResult.className = "track-result empty";
    trackResult.textContent = "Your case information will appear here.";
    renderCases();
  }
});

renderCases();
