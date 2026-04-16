document.addEventListener("DOMContentLoaded", () => {

  const qr = new QRCodeStyling({
    width: 300,
    height: 300,
    type: "svg",
    data: "",
    dotsOptions: { color: "#ffffff" },
    backgroundOptions: { color: "transparent" }
  });

  const targetUrl = document.getElementById("targetUrl");
  const videoUrl = document.getElementById("videoUrl");
  const titleInput = document.getElementById("titleInput");
  const instructionsInput = document.getElementById("instructionsInput");
  const qrContainer = document.getElementById("qrContainer");

  document.getElementById("generateBtn").onclick = () => {

    if (!targetUrl.value.trim()) {
      alert("Enter a Target URL first.");
      return;
    }

    let finalUrl = targetUrl.value.trim();

    if (videoUrl.value.trim()) {
      finalUrl += `?video=${encodeURIComponent(videoUrl.value.trim())}`;
    }

    qr.update({ data: finalUrl });

    qrContainer.innerHTML = "";
    qr.append(qrContainer);
  };

  document.getElementById("downloadPngBtn").onclick = () =>
    qr.download({ name: "qr", extension: "png" });

  document.getElementById("downloadSvgBtn").onclick = () =>
    qr.download({ name: "qr", extension: "svg" });

  document.getElementById("printBtn").onclick = () => window.print();

});
