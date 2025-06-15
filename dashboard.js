const access = JSON.parse(sessionStorage.getItem("userAccess")) || {};
const infoDisplay = document.getElementById("accessInfo");
const fileArea = document.getElementById("fileArea");

const files = {
  "L3-INTSEC": "🗂️ L3 INTSEC File",
  "L3-ETHCOM": "📄 L3 ETHCOM Report",
  "L3-SITADM": "🔒 L3 SITADM Overview",
  "L4-INTSEC": "📁 L4 INTSEC Archives",
  "L4-ETHCOM": "📋 L4 ETHCOM Directives",
  "L4-SITADM": "📌 L4 SITADM Control Sheet",
  "L5-INTSEC": "📂 L5 INTSEC Threat Matrix",
  "L5-ETHCOM": "📝 L5 ETHCOM Protocol",
  "L5-SITADM": "🔒 L5 SITADM Blackfile"
};

function render() {
  infoDisplay.innerHTML = `
    <strong>Level:</strong> ${access.level || "None"}<br/>
    <strong>Subclearances:</strong> ${access.sub?.join(", ") || "None"}<br/>
    <strong>Edit Mode:</strong> ${access.edit ? "✅" : "❌"}
  `;
  fileArea.innerHTML = "";

  access.sub?.forEach(key => {
    if (files[key]) {
      const box = document.createElement("div");
      box.className = "fileBox";
      box.innerHTML = `
        <h3>${key}</h3>
        <p>${files[key]}</p>
        ${access.edit ? `<textarea>${files[key]}</textarea>` : ""}
      `;
      fileArea.appendChild(box);
    }
  });
}

render();
