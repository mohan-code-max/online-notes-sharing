const API_URL = "http://localhost:3000/api";
const adminToken = localStorage.getItem("adminToken");

if (!adminToken) {
  window.location.href = "index.html"; // redirect if not logged in
}

// Logout
document.getElementById("adminLogoutBtn").addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  window.location.href = "index.html";
});

let allNotes = []; // store all notes for filtering

// Load all notes
async function loadAdminNotes() {
  const res = await fetch(`${API_URL}/admin/notes`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  allNotes = await res.json();
  displayNotes(allNotes);
}

// Display notes in grid
function displayNotes(notes) {
  const grid = document.getElementById("adminNotesGrid");
  grid.innerHTML = "";

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
      <button class="delete-btn" data-id="${note._id}">Delete</button>
    `;
    grid.appendChild(div);
  });

  // Delete button events
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (!confirm("Are you sure you want to delete this note?")) return;

      const res = await fetch(`${API_URL}/admin/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      alert(data.message || "Deleted");
      loadAdminNotes();
    });
  });
}

// Search notes by title
document.getElementById("adminSearchNotes").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allNotes.filter((note) =>
    note.title.toLowerCase().includes(query)
  );
  displayNotes(filtered);
});

loadAdminNotes();
