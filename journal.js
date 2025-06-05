function goTo(page) {
  window.location.href = page;
}

function logout() {
  if (confirm("Yakin ingin logout?")) {
    window.location.href = "login.html"; // Ganti jika file login berbeda
  }
}

const form = document.getElementById("journalForm");
const entryList = document.getElementById("entryList");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const date = document.getElementById("journalDate").value;
  const mood = document.getElementById("mood").value;
  const note = document.getElementById("note").value;

  const entry = { date, mood, note };
  const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  entries.push(entry);
  localStorage.setItem("journalEntries", JSON.stringify(entries));

  displayEntries();
  form.reset();
});

function deleteEntry(index) {
  const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  entries.splice(index, 1);
  localStorage.setItem("journalEntries", JSON.stringify(entries));
  displayEntries();
}

function displayEntries() {
  const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  entryList.innerHTML = "";
  entries.forEach((entry, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${entry.date}</strong> - ${entry.mood}<br>
      <em>${entry.note}</em><br>
      <button onclick="deleteEntry(${index})" class="delete-btn">
        <i class="fas fa-trash-alt"></i> Hapus
      </button>
      <hr>
    `;
    entryList.appendChild(li);
  });
}

window.onload = displayEntries;
