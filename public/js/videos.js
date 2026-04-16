function loadVideos() {
  return JSON.parse(localStorage.getItem("videos") || "[]");
}

function saveVideos(videos) {
  localStorage.setItem("videos", JSON.stringify(videos));
}

document.getElementById("addVideoBtn").onclick = () => {
  const title = document.getElementById("videoTitle").value;
  const category = document.getElementById("videoCategory").value;
  const url = document.getElementById("videoUrlInput").value;

  const videos = loadVideos();
  videos.push({ title, category, url });
  saveVideos(videos);
  renderVideos(videos);
};

document.getElementById("videoSearch").oninput = (e) => {
  const q = e.target.value.toLowerCase();
  const videos = loadVideos().filter(v =>
    v.title.toLowerCase().includes(q) ||
    v.category.toLowerCase().includes(q)
  );
  renderVideos(videos);
};

function renderVideos(videos) {
  const list = document.getElementById("videoList");
  list.innerHTML = "";
  videos.forEach(v => {
    const li = document.createElement("li");
    li.className = "item-card";
    li.innerHTML = `<strong>${v.title}</strong><br>${v.category}<br><a href="${v.url}" target="_blank">${v.url}</a>`;
    list.appendChild(li);
  });
}

renderVideos(loadVideos());
