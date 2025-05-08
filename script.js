// Section references
const welcomeSection = document.getElementById('welcome-section');
const formSection = document.getElementById('form-section');
const listSection = document.getElementById('list-section');

// Password field toggle
function togglePassword() {
  const passwordField = document.getElementById("password");
  const toggleBtn = document.getElementById("togglePassword");
  if (passwordField.type === "password") {
    passwordField.type = "text";
    toggleBtn.textContent = "🙈";
  } else {
    passwordField.type = "password";
    toggleBtn.textContent = "👁️";
  }
}

// Section navigation
function showAddForm() {
  welcomeSection.classList.add("hidden");
  formSection.classList.remove("hidden");
}

function showList() {
  welcomeSection.classList.add("hidden");
  listSection.classList.remove("hidden");
  refreshList();
}

function goBack() {
  formSection.classList.add("hidden");
  listSection.classList.add("hidden");
  welcomeSection.classList.remove("hidden");
}

// Save password
document.getElementById("passwordForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const website = document.getElementById("website").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!website || !username || !password) {
    alert("Please fill all fields.");
    return;
  }

  const entry = {
    website,
    username,
    password,
    timestamp: new Date().toLocaleString()
  };

  const savedPasswords = JSON.parse(localStorage.getItem("passwords")) || [];
  savedPasswords.push(entry);
  localStorage.setItem("passwords", JSON.stringify(savedPasswords));

  this.reset();
  alert("Password saved successfully!");
});

// Load and display list
function refreshList() {
  const listContainer = document.getElementById("passwordList");
  listContainer.innerHTML = "";

  const savedPasswords = JSON.parse(localStorage.getItem("passwords")) || [];

  if (savedPasswords.length === 0) {
    listContainer.innerHTML = "<p>No passwords saved.</p>";
    return;
  }

  savedPasswords.forEach((entry, index) => {
    const entryDiv = document.createElement("div");
    entryDiv.className = "entry";

    entryDiv.innerHTML = `
      <div class="entry-details"><strong>Website:</strong> ${entry.website}</div>
      <div class="entry-details"><strong>Username:</strong> ${entry.username}</div>
      <div class="entry-details"><strong>Password:</strong> <span id="pass-${index}">${entry.password}</span></div>
      <div class="timestamp">${entry.timestamp}</div>
      <button class="copy-btn" onclick="copyToClipboard('${entry.password}')">Copy</button>
      <button class="delete-btn" onclick="deleteEntry(${index})">Delete</button>
    `;

    listContainer.appendChild(entryDiv);
  });
}

// Copy password
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => alert("Copied to clipboard!"))
    .catch(() => alert("Failed to copy."));
}

// Delete password
function deleteEntry(index) {
  const savedPasswords = JSON.parse(localStorage.getItem("passwords")) || [];
  if (index >= 0 && index < savedPasswords.length) {
    savedPasswords.splice(index, 1);
    localStorage.setItem("passwords", JSON.stringify(savedPasswords));
    refreshList();
  }
}
