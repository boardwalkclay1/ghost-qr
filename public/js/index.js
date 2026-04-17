document.addEventListener("DOMContentLoaded", () => {

  // QR instance
  const qr = new QRCodeStyling({
    width: 300,
    height: 300,
    type: "svg",
    data: "",
    dotsOptions: { color: "#ffffff" },
    backgroundOptions: { color: "transparent" }
  });

  // Elements
  const targetUrl = document.getElementById("targetUrl");
  const videoUrl = document.getElementById("videoUrl");
  const titleInput = document.getElementById("titleInput");
  const instructionsInput = document.getElementById("instructionsInput");
  const qrContainer = document.getElementById("qrContainer");

  // Burger menu elements
  const burgerBtn = document.getElementById("burgerBtn");
  const burgerMenu = document.getElementById("burgerMenu");
  const burgerClose = document.getElementById("burgerClose");
  const burgerSearch = document.getElementById("burgerSearch");
  const burgerGuides = document.getElementById("burgerGuides");
  const burgerVideos = document.getElementById("burgerVideos");

  // Quick Access lists
  const quickGuides = document.getElementById("quickGuides");
  const quickVideos = document.getElementById("quickVideos");

  // MULTI-SELECT STORAGE
  let selectedItems = [];

  // -----------------------------
  // QR GENERATION
  // -----------------------------
  const preload = localStorage.getItem("qrStudioTarget");
  if (preload) {
    targetUrl.value = preload;
    localStorage.removeItem("qrStudioTarget");
  }

  function saveToLibrary(record) {
    const library = JSON.parse(localStorage.getItem("qrLibrary") || "[]");
    library.push(record);
    localStorage.setItem("qrLibrary", JSON.stringify(library));
  }

  document.getElementById("generateBtn").addEventListener("click", () => {
    const base = targetUrl.value.trim();
    const vid = videoUrl.value.trim();
    const title = titleInput.value.trim();
    const instructions = instructionsInput.value.trim();

    if (!base) return alert("Enter a Target URL first.");

    let finalUrl = base;
    if (vid) finalUrl += `?video=${encodeURIComponent(vid)}`;

    qr.update({ data: finalUrl });

    qrContainer.innerHTML = "";
    qr.append(qrContainer);

    saveToLibrary({
      id: crypto.randomUUID(),
      title,
      targetUrl: base,
      videoUrl: vid,
      finalUrl,
      instructions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      generateCount: 1,
      downloadCount: 0,
      printCount: 0
    });

    loadQuickAccess();
  });

  document.getElementById("downloadPngBtn").addEventListener("click", () => {
    qr.download({ name: "qr", extension: "png" });
  });

  document.getElementById("downloadSvgBtn").addEventListener("click", () => {
    qr.download({ name: "qr", extension: "svg" });
  });

  document.getElementById("shareBtn")?.addEventListener("click", async () => {
    try {
      const blob = await qr.getRawData("png");
      const file = new File([blob], "qr.png", { type: "image/png" });

      await navigator.share({
        title: "QR Code",
        text: "Scan this QR",
        files: [file]
      });
    } catch {
      alert("Sharing not supported on this device.");
    }
  });

  document.getElementById("printBtn").addEventListener("click", async () => {
    const blob = await qr.getRawData("png");
    const url = URL.createObjectURL(blob);

    const title = titleInput.value.trim() || "QR Code";

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
      <head><title>${title}</title></head>
      <body style="text-align:center; padding:40px; font-family:sans-serif;">
        <h2>${title}</h2>
        <img src="${url}" style="width:300px; height:300px;" />
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  });

  // -----------------------------
  // QUICK ACCESS (5 items each)
  // -----------------------------
  function loadQuickAccess() {
    const guides = JSON.parse(localStorage.getItem("guides") || "[]");
    const videos = JSON.parse(localStorage.getItem("videos") || "[]");

    quickGuides.innerHTML = guides.slice(-5).map(g =>
      `<li class="ql-item" data-url="https://ghost-qr.pages.dev/pages/view-guide.html?id=${g.id}">
        ${g.title}
      </li>`
    ).join("");

    quickVideos.innerHTML = videos.slice(-5).map(v =>
      `<li class="ql-item" data-url="https://ghost-qr.pages.dev/pages/view-video.html?id=${v.id}">
        ${v.title}
      </li>`
    ).join("");

    bindQuickAccessClicks();
  }

  function bindQuickAccessClicks() {
    document.querySelectorAll(".ql-item").forEach(li => {
      li.onclick = (e) => {
        if (e.shiftKey) {
          toggleSelect(li);
        } else {
          const url = li.dataset.url;
          targetUrl.value = url;

          qr.update({ data: url });
          qrContainer.innerHTML = "";
          qr.append(qrContainer);
        }
      };
    });
  }

  // -----------------------------
  // MULTI-SELECT
  // -----------------------------
  function toggleSelect(li) {
    const url = li.dataset.url;

    if (selectedItems.includes(url)) {
      selectedItems = selectedItems.filter(x => x !== url);
      li.classList.remove("ql-selected");
    } else {
      selectedItems.push(url);
      li.classList.add("ql-selected");
    }
  }

  document.getElementById("combineBtn").onclick = () => {
    if (selectedItems.length === 0) return;

    const payload = encodeURIComponent(JSON.stringify(selectedItems));
    const finalUrl = `https://ghost-qr.pages.dev/pages/multi.html?items=${payload}`;

    targetUrl.value = finalUrl;

    qr.update({ data: finalUrl });
    qrContainer.innerHTML = "";
    qr.append(qrContainer);
  };

  document.getElementById("clearSelectionBtn").onclick = () => {
    selectedItems = [];
    document.querySelectorAll(".ql-selected").forEach(el => el.classList.remove("ql-selected"));
  };

  // -----------------------------
  // BURGER MENU (FULL LIST + SEARCH)
  // -----------------------------
  burgerBtn.onclick = () => burgerMenu.classList.add("open");
  burgerClose.onclick = () => burgerMenu.classList.remove("open");

  function loadBurgerMenu() {
    const guides = JSON.parse(localStorage.getItem("guides") || "[]");
    const videos = JSON.parse(localStorage.getItem("videos") || "[]");

    burgerGuides.innerHTML = guides.map(g =>
      `<li class="burger-item" data-url="https://ghost-qr.pages.dev/pages/view-guide.html?id=${g.id}">
        ${g.title}
        <button class="addQuick">+</button>
      </li>`
    ).join("");

    burgerVideos.innerHTML = videos.map(v =>
      `<li class="burger-item" data-url="https://ghost-qr.pages.dev/pages/view-video.html?id=${v.id}">
        ${v.title}
        <button class="addQuick">+</button>
      </li>`
    ).join("");

    bindBurgerClicks();
  }

  function bindBurgerClicks() {
    document.querySelectorAll(".burger-item").forEach(li => {
      const addBtn = li.querySelector(".addQuick");

      // Load into QR Studio
      li.onclick = (e) => {
        if (e.target.classList.contains("addQuick")) return;
        const url = li.dataset.url;
        targetUrl.value = url;

        qr.update({ data: url });
        qrContainer.innerHTML = "";
        qr.append(qrContainer);
      };

      // Add to Quick Access
      addBtn.onclick = (e) => {
        e.stopPropagation();
        addToQuick(li.dataset.url, li.textContent.trim());
      };
    });
  }

  function addToQuick(url, title) {
    const list = url.includes("guide")
      ? quickGuides
      : quickVideos;

    const li = document.createElement("li");
    li.className = "ql-item";
    li.dataset.url = url;
    li.textContent = title;

    list.appendChild(li);
    bindQuickAccessClicks();
  }

  // SEARCH inside burger menu
  burgerSearch.oninput = () => {
    const term = burgerSearch.value.toLowerCase();

    document.querySelectorAll(".burger-item").forEach(li => {
      li.style.display = li.textContent.toLowerCase().includes(term)
        ? "block"
        : "none";
    });
  };

  // INIT
  loadQuickAccess();
  loadBurgerMenu();

});
