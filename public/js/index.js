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

  // Save QR to library
  function saveToLibrary(record) {
    const library = JSON.parse(localStorage.getItem("qrLibrary") || "[]");
    library.push(record);
    localStorage.setItem("qrLibrary", JSON.stringify(library));
  }

  // Generate QR
  document.getElementById("generateBtn").onclick = () => {

    const base = targetUrl.value.trim();
    const vid = videoUrl.value.trim();
    const title = titleInput.value.trim();
    const instructions = instructionsInput.value.trim();

    if (!base) {
      alert("Enter a Target URL first.");
      return;
    }

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
  };

  // Download PNG
  document.getElementById("downloadPngBtn").onclick = () =>
    qr.download({ name: "qr", extension: "png" });

  // Download SVG
  document.getElementById("downloadSvgBtn").onclick = () =>
    qr.download({ name: "qr", extension: "svg" });

  // Print
  document.getElementById("printBtn").onclick = () => window.print();

});
