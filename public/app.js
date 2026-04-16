// =========================
// app.js
// =========================

// Main orchestrator: handles views, QR logic, videos, guides, PWA

document.addEventListener("DOMContentLoaded", () => {
  // ----- VIEW SWITCHING -----
  const navButtons = document.querySelectorAll(".gb-nav-btn");
  const views = document.querySelectorAll(".gb-view");

  function setView(viewId) {
    views.forEach((v) => {
      v.classList.toggle("gb-view-active", v.id === `view-${viewId}`);
    });
    navButtons.forEach((btn) => {
      btn.classList.toggle(
        "gb-nav-btn-active",
        btn.dataset.view === viewId
      );
    });
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setView(btn.dataset.view);
    });
  });

  // ----- THEME TOGGLE -----
  const themeToggle = document.getElementById("themeToggle");
  themeToggle.addEventListener("click", () => {
    const body = document.body;
    if (body.classList.contains("theme-ghost")) {
      body.classList.remove("theme-ghost");
      body.classList.add("theme-night");
    } else {
      body.classList.remove("theme-night");
      body.classList.add("theme-ghost");
    }
  });

  // ----- QR STUDIO -----
  const targetUrlInput = document.getElementById("targetUrl");
  const videoUrlInput = document.getElementById("videoUrl");
  const titleInput = document.getElementById("titleInput");
  const instructionsInput = document.getElementById("instructionsInput");
  const sizeSelect = document.getElementById("sizeSelect");
  const colorSelect = document.getElementById("colorSelect");
  const backgroundModeSelect = document.getElementById("backgroundModeSelect");

  const previewTitle = document.getElementById("previewTitle");
  const previewInstructions = document.getElementById("previewInstructions");
  const previewVideoNote = document.getElementById("previewVideoNote");
  const previewCard = document.getElementById("previewCard");
  const qrContainer = document.getElementById("qrContainer");

  const generateBtn = document.getElementById("generateBtn");
  const downloadPngBtn = document.getElementById("downloadPngBtn");
  const downloadSvgBtn = document.getElementById("downloadSvgBtn");
  const printBtn = document.getElementById("printBtn");

  const presetNameInput = document.getElementById("presetName");
  const savePresetBtn = document.getElementById("savePresetBtn");
  const presetList = document.getElementById("presetList");

  // QR Code Styling instance
  const qrCode = new QRCodeStyling({
    width: 288, // 3in * 96dpi
    height: 288,
    type: "svg",
    data: "https://ghostboards.com/",
    image: "ghostboards-logo.svg",
    margin: 4,
    dotsOptions: {
      color: "#000000",
      type: "rounded"
    },
    backgroundOptions: {
      color: "transparent"
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 4
    }
  });

  qrCode.append(qrContainer);

  function inchesToPixels(inches) {
    const dpi = 96;
    return Math.round(inches * dpi);
  }

  function applySize(inches) {
    const px = inchesToPixels(inches);
    qrCode.update({
      width: px,
      height: px
    });
    previewCard.style.width = inches + "in";
    previewCard.style.minHeight = inches + "in";
  }

  function applyColorAndBackground(colorMode, backgroundMode) {
    let dotsColor = "#000000";
    let bgColor = "transparent";

    if (colorMode === "ghost-green") {
      dotsColor = "#00ff9f";
    } else if (colorMode === "white-on-black") {
      dotsColor = "#ffffff";
      bgColor = "#000000";
    }

    if (backgroundMode === "white") {
      bgColor = "#ffffff";
    } else if (backgroundMode === "clear") {
      if (colorMode !== "white-on-black") {
        bgColor = "transparent";
      }
    }

    qrCode.update({
      dotsOptions: { color: dotsColor, type: "rounded" },
      backgroundOptions: { color: bgColor }
    });
  }

  function buildDataUrl(target, video) {
    if (!target && !video) {
      return "https://ghostboards.com/";
    }
    if (target && !video) return target;
    if (!target && video) return video;

    const encodedTarget = encodeURIComponent(target);
    const encodedVideo = encodeURIComponent(video);
    return `https://ghostboards.com/qr?care=${encodedTarget}&video=${encodedVideo}`;
  }

  function updatePreview() {
    const target = targetUrlInput.value.trim();
    const video = videoUrlInput.value.trim();
    const title = titleInput.value.trim() || "Board Care Guide";
    const instructions =
      instructionsInput.value.trim() ||
      "1. Wipe with damp cloth only. 2. Avoid soaking wheels. 3. Store in a cool, dry place.";
    const sizeInches = parseFloat(sizeSelect.value) || 3;
    const colorMode = colorSelect.value;
    const backgroundMode = backgroundModeSelect.value;

    const dataUrl = buildDataUrl(target, video);

    previewTitle.textContent = title;
    previewInstructions.textContent = instructions;

    if (video) {
      previewVideoNote.textContent = "Includes how‑to video: " + video;
    } else {
      previewVideoNote.textContent = "";
    }

    applySize(sizeInches);
    applyColorAndBackground(colorMode, backgroundMode);

    qrCode.update({ data: dataUrl });
  }

  // Presets
  const PRESET_KEY = "ghostboards_qr_presets_v1";

  function loadPresets() {
    try {
      const raw = localStorage.getItem(PRESET_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  function savePresets(list) {
    localStorage.setItem(PRESET_KEY, JSON.stringify(list));
  }

  function renderPresets() {
    const presets = loadPresets();
    presetList.innerHTML = "";
    if (!presets.length) return;

    presets.forEach((preset) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.className = "preset-button";
      btn.type = "button";
      btn.innerHTML = `
        <span>${preset.name}</span>
        <span>${preset.size}" • ${preset.color} • ${preset.background}</span>
      `;
      btn.addEventListener("click", () => {
        targetUrlInput.value = preset.target || "";
        videoUrlInput.value = preset.video || "";
        titleInput.value = preset.title || "";
        instructionsInput.value = preset.instructions || "";
        sizeSelect.value = String(preset.size || "3");
        colorSelect.value = preset.color || "black";
        backgroundModeSelect.value = preset.background || "clear";
        updatePreview();
      });
      li.appendChild(btn);
      presetList.appendChild(li);
    });
  }

  // QR events
  generateBtn.addEventListener("click", (e) => {
    e.preventDefault();
    updatePreview();
  });

  downloadPngBtn.addEventListener("click", () => {
    qrCode.download({
      name: "ghostboards-qr",
      extension: "png"
    });
  });

  downloadSvgBtn.addEventListener("click", () => {
    qrCode.download({
      name: "ghostboards-qr",
      extension: "svg"
    });
  });

  printBtn.addEventListener("click", () => {
    updatePreview();
    window.print();
  });

  savePresetBtn.addEventListener("click", () => {
    const name = presetNameInput.value.trim();
    if (!name) {
      alert("Give the preset a name first.");
      return;
    }

    const presets = loadPresets();
    const preset = {
      name,
      target: targetUrlInput.value.trim(),
      video: videoUrlInput.value.trim(),
      title: titleInput.value.trim(),
      instructions: instructionsInput.value.trim(),
      size: parseFloat(sizeSelect.value) || 3,
      color: colorSelect.value,
      background: backgroundModeSelect.value
    };

    const existingIndex = presets.findIndex((p) => p.name === name);
    if (existingIndex >= 0) {
      presets[existingIndex] = preset;
    } else {
      presets.push(preset);
    }

    savePresets(presets);
    presetNameInput.value = "";
    renderPresets();
  });

  [targetUrlInput, videoUrlInput, titleInput, instructionsInput].forEach((el) => {
    el.addEventListener("input", updatePreview);
  });

  [sizeSelect, colorSelect, backgroundModeSelect].forEach((el) => {
    el.addEventListener("change", updatePreview);
  });

  // ----- VIDEO LIBRARY -----
  const VIDEO_KEY = "ghostboards_videos_v1";
  const videoTitleInput = document.getElementById("videoTitle");
  const videoCategoryInput = document.getElementById("videoCategory");
  const videoUrlField = document.getElementById("videoUrlInput");
  const addVideoBtn = document.getElementById("addVideoBtn");
  const videoSearchInput = document.getElementById("videoSearch");
  const videoList = document.getElementById("videoList");

  function loadVideos() {
    try {
      const raw = localStorage.getItem(VIDEO_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  function saveVideos(list) {
    localStorage.setItem(VIDEO_KEY, JSON.stringify(list));
  }

  function renderVideos(filter = "") {
    const videos = loadVideos();
    const q = filter.toLowerCase();
    videoList.innerHTML = "";

    videos
      .filter((v) => {
        if (!q) return true;
        return (
          v.title.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
        );
      })
      .forEach((v) => {
        const li = document.createElement("li");
        const card = document.createElement("div");
        card.className = "item-card";
        card.innerHTML = `
          <div class="item-card-title">${v.title}</div>
          <div class="item-card-meta">${v.category} • ${v.url}</div>
        `;
        li.appendChild(card);
        videoList.appendChild(li);
      });
  }

  addVideoBtn.addEventListener("click", () => {
    const title = videoTitleInput.value.trim();
    const category = videoCategoryInput.value.trim();
    const url = videoUrlField.value.trim();

    if (!title || !url) {
      alert("Title and URL are required for a video.");
      return;
    }

    const videos = loadVideos();
    videos.push({ title, category, url });
    saveVideos(videos);

    videoTitleInput.value = "";
    videoCategoryInput.value = "";
    videoUrlField.value = "";

    renderVideos(videoSearchInput.value.trim());
  });

  videoSearchInput.addEventListener("input", () => {
    renderVideos(videoSearchInput.value.trim());
  });

  // ----- GUIDES LIBRARY -----
  const GUIDE_KEY = "ghostboards_guides_v1";
  const guideTitleInput = document.getElementById("guideTitle");
  const guideCategoryInput = document.getElementById("guideCategory");
  const guideContentInput = document.getElementById("guideContent");
  const addGuideBtn = document.getElementById("addGuideBtn");
  const guideSearchInput = document.getElementById("guideSearch");
  const guideList = document.getElementById("guideList");

  function loadGuides() {
    try {
      const raw = localStorage.getItem(GUIDE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  function saveGuides(list) {
    localStorage.setItem(GUIDE_KEY, JSON.stringify(list));
  }

  function renderGuides(filter = "") {
    const guides = loadGuides();
    const q = filter.toLowerCase();
    guideList.innerHTML = "";

    guides
      .filter((g) => {
        if (!q) return true;
        return (
          g.title.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.content.toLowerCase().includes(q)
        );
      })
      .forEach((g) => {
        const li = document.createElement("li");
        const card = document.createElement("div");
        card.className = "item-card";
        card.innerHTML = `
          <div class="item-card-title">${g.title}</div>
          <div class="item-card-meta">${g.category}</div>
          <div class="item-card-body">${g.content.substring(0, 160)}${g.content.length > 160 ? "..." : ""}</div>
        `;
        li.appendChild(card);
        guideList.appendChild(li);
      });
  }

  addGuideBtn.addEventListener("click", () => {
    const title = guideTitleInput.value.trim();
    const category = guideCategoryInput.value.trim();
    const content = guideContentInput.value.trim();

    if (!title || !content) {
      alert("Title and content are required for a guide.");
      return;
    }

    const guides = loadGuides();
    guides.push({ title, category, content });
    saveGuides(guides);

    guideTitleInput.value = "";
    guideCategoryInput.value = "";
    guideContentInput.value = "";

    renderGuides(guideSearchInput.value.trim());
  });

  guideSearchInput.addEventListener("input", () => {
    renderGuides(guideSearchInput.value.trim());
  });

  // ----- INITIALIZE -----
  renderPresets();
  updatePreview();
  renderVideos();
  renderGuides();

  // ----- PWA SERVICE WORKER -----
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {
      // fail silently; app still works
    });
  }
});
