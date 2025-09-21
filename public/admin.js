const API_URL = "http://localhost:3000/api";
const adminToken = localStorage.getItem("adminToken");

// Redirect if not logged in
if (!adminToken) {
  window.location.href = "index.html";
}

// Logout button
document.getElementById("adminLogoutBtn").addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  window.location.href = "index.html";
});

let allNotes = []; // Store all notes for filtering

// Load all notes
async function loadAdminNotes() {
  const grid = document.getElementById("adminNotesGrid");
  grid.innerHTML = "<p>Loading notes...</p>";

  try {
    const res = await fetch(`${API_URL}/admin/notes`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (!res.ok) throw new Error("Failed to fetch notes");
    allNotes = await res.json();

    if (!Array.isArray(allNotes) || allNotes.length === 0) {
      grid.innerHTML = "<p>No notes found.</p>";
    } else {
      displayNotes(allNotes);
    }
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p style="color:red">Error loading notes: ${err.message}</p>`;
  }
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

  // Attach delete events
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (!confirm("Are you sure you want to delete this note?")) return;

      btn.disabled = true;
      btn.innerText = "Deleting...";

      try {
        const res = await fetch(`${API_URL}/admin/notes/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Delete failed");

        loadAdminNotes();
      } catch (err) {
        alert("Error deleting note: " + err.message);
        console.error(err);
        btn.disabled = false;
        btn.innerText = "Delete";
      }
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

// Initial load
loadAdminNotes();
