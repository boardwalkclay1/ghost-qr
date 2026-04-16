function loadGuides() {
  return JSON.parse(localStorage.getItem("guides") || "[]");
}

function saveGuides(guides) {
  localStorage.setItem("guides", JSON.stringify(guides));
}

document.getElementById("addGuideBtn").onclick = () => {
  const title = document.getElementById("guideTitle").value;
  const category = document.getElementById("guideCategory").value;
  const content = document.getElementById("guideContent").value;

  const guides = loadGuides();
  guides.push({ title, category, content });
  saveGuides(guides);
  renderGuides(guides);
};

document.getElementById("guideSearch").oninput = (e) => {
  const q = e.target.value.toLowerCase();
  const guides = loadGuides().filter(g =>
    g.title.toLowerCase().includes(q) ||
    g.category.toLowerCase().includes(q) ||
    g.content.toLowerCase().includes(q)
  );
  renderGuides(guides);
};

function renderGuides(guides) {
  const list = document.getElementById("guideList");
  list.innerHTML = "";
  guides.forEach(g => {
    const li = document.createElement("li");
    li.className = "item-card";
    li.innerHTML = `<strong>${g.title}</strong><br>${g.category}<br>${g.content.substring(0,120)}...`;
    list.appendChild(li);
  });
}

renderGuides(loadGuides());
