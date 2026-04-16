document.addEventListener("DOMContentLoaded", () => {

  const titleEl = document.getElementById("videoTitle");
  const categoryEl = document.getElementById("videoCategory");
  const urlEl = document.getElementById("videoUrlInput");
  const addBtn = document.getElementById("addVideoBtn");

  const searchEl = document.getElementById("videoSearch");
  const listEl = document.getElementById("videoList");

  function loadVideos() {
    return JSON.parse(localStorage.getItem("videos") || "[]");
  }

  function saveVideos(data) {
    localStorage.setItem("videos", JSON.stringify(data));
  }

  addBtn.onclick = () => {
    const title = titleEl.value.trim();
    const category = categoryEl.value.trim();
    const url = urlEl.value.trim();

    if (!title || !url) return;

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

  listEl.addEventListener("click", e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const li = btn.closest("li");
    const id = li.dataset.id;

    const videos = loadVideos();
    const video = videos.find(v => v.id === id);
    if (!video) return;

    if (action === "qr") {
      const qrUrl = `https://ghostboards.com/video?id=${id}`;
      localStorage.setItem("qrStudioTarget", qrUrl);
      window.location.href = "/index.html";
      return;
    }

    if (action === "copy") {
      navigator.clipboard.writeText(`https://ghostboards.com/video?id=${id}`);
      return;
    }

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
