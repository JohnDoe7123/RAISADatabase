let access = JSON.parse(sessionStorage.getItem("userAccess")) || {};
let infoDisplay = document.getElementById("accessInfo");
let fileArea = document.getElementById("fileArea");

let files = JSON.parse(sessionStorage.getItem("classifiedFiles")) || {
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
        <h3 class="collapser" onclick="toggleFile('${key}')">${key}</h3>
        <div class="fileContent" id="file-${key}" style="display:none;">
          ${access.edit 
            ? `<textarea id="edit-${key}">${files[key]}</textarea>
               <br/>
               <button onclick="saveFile('${key}')">💾 Save</button>
               <button onclick="deleteFile('${key}')">🗑️ Delete</button>`
            : `<p>${files[key]}</p>`
          }
        </div>
      `;
      fileArea.appendChild(box);
    }
  });

  if (access.edit) {
    const creator = document.createElement("div");
    creator.className = "fileBox";
    creator.innerHTML = `
      <h3>Create New File</h3>
      <input type="text" id="newKey" placeholder="Enter new subclearance key (e.g. L3-NEW)" />
      <textarea id="newContent" placeholder="Enter content..."></textarea>
      <button onclick="createFile()">➕ Create File</button>
    `;
    fileArea.appendChild(creator);
  }

  sessionStorage.setItem("classifiedFiles", JSON.stringify(files));
}

function toggleFile(key) {
  const el = document.getElementById(`file-${key}`);
  el.style.display = (el.style.display === "none") ? "block" : "none";
}

function saveFile(key) {
  const content = document.getElementById(`edit-${key}`).value;
  files[key] = content;
  sessionStorage.setItem("classifiedFiles", JSON.stringify(files));
  render();
}

function deleteFile(key) {
  if (confirm(`Are you sure you want to delete ${key}?`)) {
    delete files[key];
    sessionStorage.setItem("classifiedFiles", JSON.stringify(files));
    render();
  }
}

function createFile() {
  const key = document.getElementById("newKey").value.trim();
  const content = document.getElementById("newContent").value.trim();

  if (!key || !content) {
    alert("Key and content required.");
    return;
  }

  if (files[key]) {
    alert("File with this key already exists.");
    return;
  }

  files[key] = content;
  sessionStorage.setItem("classifiedFiles", JSON.stringify(files));
  render();
}

function logout() {
  if (confirm("Are you sure you want to log out?")) {
    sessionStorage.clear();
    window.location.href = "index.html";
  }
}

render();
