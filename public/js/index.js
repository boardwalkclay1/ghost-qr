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

  // Preload from guides/videos
  const preload = localStorage.getItem("qrStudioTarget");
  if (preload) {
    targetUrl.value = preload;
    localStorage.removeItem("qrStudioTarget");
  }

  // Save QR record
  function saveToLibrary(record) {
    const library = JSON.parse(localStorage.getItem("qrLibrary") || "[]");
    library.push(record);
    localStorage.setItem("qrLibrary", JSON.stringify(library));
  }

  // Generate QR
  document.getElementById("generateBtn").addEventListener("click", () => {

    const base = targetUrl.value.trim();
    const vid = videoUrl.value.trim();
    const title = titleInput.value.trim();
    const instructions = instructionsInput.value.trim();

    if (!base) return alert("Enter a Target URL first.");

    let finalUrl = base;
    if (vid) finalUrl += `?video=${encodeURIComponent(vid)}`;

    // Update QR
    qr.update({ data: finalUrl });

    // Render QR
    qrContainer.innerHTML = "";
    qr.append(qrContainer);

    // Save record
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
  });

  // Download PNG
  document.getElementById("downloadPngBtn").addEventListener("click", () => {
    qr.download({ name: "qr", extension: "png" });
  });

  // Download SVG
  document.getElementById("downloadSvgBtn").addEventListener("click", () => {
    qr.download({ name: "qr", extension: "svg" });
  });

  // Print
  document.getElementById("printBtn").addEventListener("click", () => {
    window.print();
  });

});
