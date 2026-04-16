document.addEventListener("DOMContentLoaded", () => {

  const titleEl = document.getElementById("guideTitle");
  const categoryEl = document.getElementById("guideCategory");
  const contentEl = document.getElementById("guideContent");
  const addBtn = document.getElementById("addGuideBtn");

  const searchEl = document.getElementById("guideSearch");
  const listEl = document.getElementById("guideList");

  // Load guides
  function loadGuides() {
    return JSON.parse(localStorage.getItem("guides") || "[]");
  }

  // Save guides
  function saveGuides(data) {
    localStorage.setItem("guides", JSON.stringify(data));
  }

  // Add guide
  addBtn.onclick = () => {
    const title = titleEl.value.trim();
    const category = categoryEl.value.trim();
    const content = contentEl.value.trim();

    if (!title || !content) {
      alert("Title and content are required.");
      return;
    }

    const guides = loadGuides();

    guides.push({
      id: crypto.randomUUID(),
      title,
      category,
      content,
      createdAt: Date.now()
    });

    saveGuides(guides);

    titleEl.value = "";
    categoryEl.value = "";
    contentEl.value = "";

    renderList();
  };

  // Render list
  function renderList() {
    const guides = loadGuides();
    const search = searchEl.value.toLowerCase();

    listEl.innerHTML = "";

    guides
      .filter(g =>
        g.title.toLowerCase().includes(search) ||
        g.category.toLowerCase().includes(search) ||
        g.content.toLowerCase().includes(search)
      )
      .forEach(g => {
        const li = document.createElement("li");
        li.className = "item-card";
        li.dataset.id = g.id;

        li.innerHTML = `
          <h3>${g.title}</h3>
          <p><strong>Category:</strong> ${g.category || "None"}</p>
          <p><strong>Created:</strong> ${new Date(g.createdAt).toLocaleString()}</p>

          <div class="gb-row">
            <button class="gb-btn ghost-primary" data-action="qr">Generate QR</button>
            <button class="gb-btn ghost-secondary" data-action="copy">Copy Link</button>
            <button class="gb-btn ghost-danger" data-action="delete">Delete</button>
          </div>
        `;

        listEl.appendChild(li);
      });
  }

  // Handle actions
  listEl.addEventListener("click", e => {
    const btn = e.target;
    const action = btn.dataset.action;
    if (!action) return;

    const li = btn.closest("li");
    const id = li.dataset.id;

    const guides = loadGuides();
    const guide = guides.find(g => g.id === id);
    if (!guide) return;

    // Generate QR
    if (action === "qr") {
      const qrUrl = `https://ghostboards.com/guide?id=${id}`;
      localStorage.setItem("qrStudioTarget", qrUrl);
      window.location.href = "/index.html";
      return;
    }

    // Copy link
    if (action === "copy") {
      navigator.clipboard.writeText(`https://ghostboards.com/guide?id=${id}`);
      return;
    }

    // Delete
    if (action === "delete") {
      const updated = guides.filter(g => g.id !== id);
      saveGuides(updated);
      renderList();
      return;
    }
  });

  searchEl.addEventListener("input", renderList);

  renderList();
});
