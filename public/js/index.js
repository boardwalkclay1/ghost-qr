const qr = new QRCodeStyling({
  width: 300,
  height: 300,
  type: "svg",
  data: "",
  dotsOptions: { color: "#000" },
  backgroundOptions: { color: "transparent" }
});

document.getElementById("generateBtn").onclick = () => {
  const url = document.getElementById("targetUrl").value;
  const video = document.getElementById("videoUrl").value;
  const title = document.getElementById("titleInput").value;
  const instructions = document.getElementById("instructionsInput").value;

  const finalUrl = video ? `${url}?video=${encodeURIComponent(video)}` : url;

  qr.update({ data: finalUrl });
  document.getElementById("qrContainer").innerHTML = "";
  qr.append(document.getElementById("qrContainer"));
};

document.getElementById("downloadPngBtn").onclick = () => qr.download({ name: "qr", extension: "png" });
document.getElementById("downloadSvgBtn").onclick = () => qr.download({ name: "qr", extension: "svg" });
document.getElementById("printBtn").onclick = () => window.print();
