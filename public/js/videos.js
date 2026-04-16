document.addEventListener("DOMContentLoaded", () => {

  const titleEl = document.getElementById("videoTitle");
  const categoryEl = document.getElementById("videoCategory");
  const urlEl = document.getElementById("videoUrlInput");
  const addBtn = document.getElementById("addVideoBtn");

  const searchEl = document.getElementById("videoSearch");
  const listEl = document.getElementById("videoList");

  // Load videos
  function loadVideos() {
    return JSON.parse(localStorage.getItem("videos") || "[]");
  }

  // Save videos
  function saveVideos(data) {
    localStorage.setItem("videos", JSON.stringify(data));
  }

  // Add video
  addBtn.onclick = () => {
    const title = titleEl.value.trim();
    const category = categoryEl.value.trim();
    const url = urlEl.value.trim();

    if (!title || !url) {
      alert("Title and Video URL are required.");
      return;
    }

    const videos = loadVideos();

    videos.push({
      id: crypto.randomUUID(),
      title,
      category,
      url,
      createdAt: Date.now()
    });

    saveVideos(videos);

    titleEl.value = "";
    categoryEl.value = "";
    urlEl.value = "";

    renderList();
  };

  // Render list
  function renderList() {
    const videos = loadVideos();
    const search = searchEl.value.toLowerCase();

    listEl.innerHTML = "";

    videos
      .filter(v =>
        v.title.toLowerCase().includes(search) ||
        v.category.toLowerCase().includes(search) ||
        v.url.toLowerCase().includes(search)
      )
      .forEach(v => {
        const li = document.createElement("li");
        li.className = "item-card";
        li.dataset.id = v.id;

        li.innerHTML = `
          <h3>${v.title}</h3>
          <p><strong>Category:</strong> ${v.category || "None"}</p>
          <p><strong>URL:</strong> ${v.url}</p>
          <p><strong>Created:</strong> ${new Date(v.createdAt).toLocaleString()}</p>

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

    const videos = loadVideos();
    const video = videos.find(v => v.id === id);
    if (!video) return;

    // Generate QR
    if (action === "qr") {
      const qrUrl = `https://ghostboards.com/video?id=${id}`;
      localStorage.setItem("qrStudioTarget", qrUrl);
      window.location.href = "/index.html";
      return;
    }

    // Copy link
    if (action === "copy") {
      navigator.clipboard.writeText(`https://ghostboards.com/video?id=${id}`);
      return;
    }

    // Delete
    if (action === "delete") {
      const updated = videos.filter(v => v.id !== id);
      saveVideos(updated);
      renderList();
      return;
    }
  });

  searchEl.addEventListener("input", renderList);

  renderList();
});
