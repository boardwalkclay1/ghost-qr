document.addEventListener("DOMContentLoaded", () => {

  const listEl = document.getElementById("qrList");
  const searchEl = document.getElementById("searchInput");

  function loadLibrary() {
    return JSON.parse(localStorage.getItem("qrLibrary") || "[]");
  }

  function saveLibrary(data) {
    localStorage.setItem("qrLibrary", JSON.stringify(data));
  }

  function renderList() {
    const library = loadLibrary();
    const search = searchEl.value.toLowerCase();

    listEl.innerHTML = "";

    library
      .filter(item =>
        item.title.toLowerCase().includes(search) ||
        item.targetUrl.toLowerCase().includes(search)
      )
      .forEach(item => {
        const li = document.createElement("li");
        li.className = "item-card";

        li.innerHTML = `
          <h3>${item.title}</h3>
          <p><strong>URL:</strong> ${item.targetUrl}</p>
          ${item.videoUrl ? `<p><strong>Video:</strong> ${item.videoUrl}</p>` : ""}
          <p><strong>Created:</strong> ${new Date(item.createdAt).toLocaleString()}</p>

          <div class="qr-preview" id="qr-${item.id}"></div>

          <div class="gb-row">
            <button class="gb-btn ghost-secondary" data-action="png" data-id="${item.id}">PNG</button>
            <button class="gb-btn ghost-outline" data-action="svg" data-id="${item.id}">SVG</button>
            <button class="gb-btn ghost-primary" data-action="print" data-id="${item.id}">Print</button>
            <button class="gb-btn ghost-danger" data-action="delete" data-id="${item.id}">Delete</button>
          </div>
        `;

        listEl.appendChild(li);

        // Render QR preview
        const qr = new QRCodeStyling({
          width: 120,
          height: 120,
          type: "svg",
          data: item.finalUrl,
          dotsOptions: { color: "#ffffff" },
          backgroundOptions: { color: "transparent" }
        });

        qr.append(document.getElementById(`qr-${item.id}`));
      });
  }

  // Handle button actions
  listEl.addEventListener("click", e => {
    const btn = e.target;
    const id = btn.dataset.id;
    const action = btn.dataset.action;

    if (!id || !action) return;

    const library = loadLibrary();
    const item = library.find(x => x.id === id);

    if (!item) return;

    const qr = new QRCodeStyling({
      width: 300,
      height: 300,
      type: "svg",
      data: item.finalUrl,
      dotsOptions: { color: "#ffffff" },
      backgroundOptions: { color: "transparent" }
    });

    if (action === "png") {
      qr.download({ name: item.title, extension: "png" });
      item.downloadCount++;
    }

    if (action === "svg") {
      qr.download({ name: item.title, extension: "svg" });
      item.downloadCount++;
    }

    if (action === "print") {
      const w = window.open("");
      w.document.write(`<img src="${qr._svg}" />`);
      w.print();
      w.close();
      item.printCount++;
    }

    if (action === "delete") {
      const updated = library.filter(x => x.id !== id);
      saveLibrary(updated);
      renderList();
      return;
    }

    saveLibrary(library);
  });

  searchEl.addEventListener("input", renderList);

  renderList();
});
