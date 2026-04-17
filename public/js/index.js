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

  // Share QR (AirDrop, Messages, Email, etc.)
  document.getElementById("shareBtn")?.addEventListener("click", async () => {
    try {
      const blob = await qr.getRawData("png");
      const file = new File([blob], "qr.png", { type: "image/png" });

      await navigator.share({
        title: "QR Code",
        text: "Scan this QR",
        files: [file]
      });
    } catch (err) {
      alert("Sharing not supported on this device.");
    }
  });

  // Print ONLY the QR preview
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

});
