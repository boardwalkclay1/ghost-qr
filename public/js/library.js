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
        (item.title || "").toLowerCase().includes(search) ||
        (item.targetUrl || "").toLowerCase().includes(search) ||
        (item.finalUrl || "").toLowerCase().includes(search)
      )
      .forEach(item => {
        const li = document.createElement("li");
        li.className = "item-card";
        li.dataset.id = item.id;

        li.innerHTML = `
          <h3>${item.title || "Untitled QR"}</h3>
          <p><strong>URL:</strong> ${item.finalUrl}</p>
          <p><strong>Created:</strong> ${new Date(item.createdAt).toLocaleString()}</p>

          <div class="qr-preview" id="qr-${item.id}"></div>

          <div class="gb-row">
            <button class="gb-btn ghost-secondary" data-action="png">PNG</button>
            <button class="gb-btn ghost-outline" data-action="svg">SVG</button>
            <button class="gb-btn ghost-primary" data-action="print">Print</button>
            <button class="gb-btn ghost-danger" data-action="delete">Delete</button>
          </div>
        `;

        listEl.appendChild(li);

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

  listEl.addEventListener("click", async e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const li = btn.closest("li");
    const id = li.dataset.id;

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
      qr.download({ name: item.title || "qr", extension: "png" });
      item.downloadCount++;
    }

    if (action === "svg") {
      qr.download({ name: item.title || "qr", extension: "svg" });
      item.downloadCount++;
    }

    if (action === "print") {
      const blob = await qr.getRawData("png");
      const url = URL.createObjectURL(blob);

      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
        <head><title>${item.title || "QR Code"}</title></head>
        <body style="text-align:center; padding:40px; font-family:sans-serif;">
          <h2>${item.title || "QR Code"}</h2>
          <img src="${url}" style="width:300px; height:300px;" />
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();

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
