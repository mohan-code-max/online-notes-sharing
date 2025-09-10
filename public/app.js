const API_URL = "http://localhost:3000/api";

let isLogin = true;
let isAdminLogin = false;
let allUserNotes = []; // store all notes for search

// Toggle user login/register
document.getElementById("toggleAuth").addEventListener("click", () => {
  isLogin = !isLogin;
  document.getElementById("authTitle").innerText = isLogin
    ? "Login"
    : "Register";
  document.getElementById("authAction").innerText = isLogin
    ? "Login"
    : "Register";
  document.getElementById("toggleAuth").innerText = isLogin
    ? "Don't have an account? Register"
    : "Already have an account? Login";
});

// Admin login button
document.getElementById("adminLoginToggle").addEventListener("click", () => {
  isAdminLogin = true;
  document.getElementById("authTitle").innerText = "Admin Login";
  document.getElementById("authAction").innerText = "Login";
  document.getElementById("toggleAuth").style.display = "none";
  document.getElementById("adminLoginToggle").style.display = "none";
});

// Login/Register handler
document.getElementById("authAction").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const endpoint = isAdminLogin
    ? "/admin/login"
    : isLogin
    ? "/auth/login"
    : "/auth/register";

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  document.getElementById("authMsg").innerText = data.message || "";

  if (data.success && data.token) {
    if (isAdminLogin) {
      localStorage.setItem("adminToken", data.token);
      window.location.href = "admin-dashboard.html";
    } else {
      localStorage.setItem("token", data.token);
      document.getElementById("authSection").style.display = "none";
      document.getElementById("mainSection").style.display = "block";
      loadNotes();
    }
  }
});

// Logout
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  document.getElementById("mainSection").style.display = "none";
  document.getElementById("authSection").style.display = "block";
});

// Upload notes
document.getElementById("uploadForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const formData = new FormData(e.target);

  const res = await fetch(`${API_URL}/notes`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  document.getElementById("uploadMsg").innerText =
    data.message || data.msg || "";
  if (data.success) {
    e.target.reset();
    loadNotes();
  }
});

// Load notes
async function loadNotes() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/notes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  allUserNotes = await res.json();
  renderNotes(allUserNotes);
}

// Render notes
function renderNotes(notes) {
  const notesGrid = document.getElementById("notesGrid");
  notesGrid.innerHTML = "";

  if (notes.length === 0) {
    notesGrid.innerHTML = "<p>No notes found.</p>";
    return;
  }

  notes.forEach((note) => {
    const div = document.createElement("div");
    div.className = "note-card";
    div.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.text || ""}</p>
      <p><b>Author:</b> ${note.author?.username || "Unknown"}</p>
      ${
        note.file
          ? `<a href="/uploads/${note.file.filename}" target="_blank">view</a>`
          : ""
      }
    `;
    notesGrid.appendChild(div);
  });
}

// 🔎 Search by Title
document.getElementById("userSearchNotes")?.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allUserNotes.filter((note) =>
    note.title.toLowerCase().includes(query)
  );
  renderNotes(filtered);
});

// Toggle sections
document.getElementById("notesBtn")?.addEventListener("click", () => {
  document.getElementById("notesSection").style.display = "block";
  document.getElementById("uploadSection").style.display = "none";
});
document.getElementById("uploadBtn")?.addEventListener("click", () => {
  document.getElementById("notesSection").style.display = "none";
  document.getElementById("uploadSection").style.display = "block";
});
