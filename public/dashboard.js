console.log("Loaded access:", access);

async function pushToGitHub(filename, content) {
  const token = 'YOUR_PERSONAL_ACCESS_TOKEN'; // secure this!
  const repo = 'your-repo';
  const owner = 'your-username';
  const path = `files/${filename}`;
  const branch = 'main';
  const message = `Add or update file ${filename}`;

  const base64Content = btoa(unescape(encodeURIComponent(content)));

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      content: base64Content,
      branch
    })
  });

  const result = await res.json();
  if (res.status === 201 || res.status === 200) {
    alert("File successfully saved to GitHub");
  } else {
    console.error("GitHub API Error:", result);
    alert("Error saving file.");
  }
}



let access = JSON.parse(sessionStorage.getItem("userAccess")) || {
  level: null,
  sub: [],
  edit: false
};

let files = JSON.parse(sessionStorage.getItem("classifiedFiles")) || [
  {
    title: "INTSEC Protocol Alpha",
    content: "Sensitive internal security briefing.",
    minClearance: 3,
    subclearances: ["INTSEC"]
  },
  {
    title: "Ethics Panel Transcript",
    content: "Notes from the L4 ETHCOM tribunal.",
    minClearance: 4,
    subclearances: ["ETHCOM"]
  },
  {
    title: "General Level 2 Notice",
    content: "No subclearance needed here.",
    minClearance: 2,
    subclearances: []
  }
];

const fileArea = document.getElementById("fileArea");
const infoDisplay = document.getElementById("accessInfo");

function hasAccess(file) {
  const levelOK = access.level === "OVERRIDE" || parseInt(access.level) >= file.minClearance;
  const subsOK = file.subclearances.length === 0 || file.subclearances.every(s => access.sub.includes(s));
  return levelOK && subsOK;
}

function render() {
  infoDisplay.innerHTML = `
    <strong>Level:</strong> ${access.level || "None"}<br/>
    <strong>Subclearances:</strong> ${access.sub?.join(", ") || "None"}<br/>
    <strong>Edit Mode:</strong> ${access.edit ? "✅" : "❌"}
  `;

  fileArea.innerHTML = "";

  files.forEach((file, i) => {
    if (hasAccess(file)) {
      const box = document.createElement("div");
      box.className = "fileBox";
      box.innerHTML = `
        <h3 class="collapser" onclick="toggleFile(${i})">${file.title}</h3>
        <div class="fileContent" id="file-${i}" style="display:none;">
          ${access.edit 
            ? `<textarea id="edit-${i}">${file.content}</textarea>
               <br/>
               ${clearanceDropdown(`min-${i}`, file.minClearance)}
               ${subclearanceMulti(`subs-${i}`, file.subclearances)}
               <br/>
               <button onclick="saveFile(${i})">💾 Save</button>
               <button onclick="deleteFile(${i})">🗑️ Delete</button>`
            : `<p>${file.content}</p>`
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
      <input type="text" id="newTitle" placeholder="Title" />
      <textarea id="newContent" placeholder="File content..."></textarea>
      ${clearanceDropdown("newMin")}
      ${subclearanceMulti("newSubs")}
      <button onclick="createFile()">➕ Create File</button>
    `;
    fileArea.appendChild(creator);
  }

  sessionStorage.setItem("classifiedFiles", JSON.stringify(files));
}

function clearanceDropdown(id, selected = 0) {
  const levels = [0, 1, 2, 3, 4, 5, "OVERRIDE"];
  return `
    <label>Clearance Level:
      <select id="${id}">
        ${levels.map(level => 
          `<option value="${level}" ${level == selected ? "selected" : ""}>Level ${level}</option>`
        ).join("")}
      </select>
    </label>
  `;
}

function subclearanceMulti(id, selected = []) {
  const subclearances = ["INTSEC", "ETHCOM", "SITADM"];
  return `
    <label>Subclearances:<br/>
      <select id="${id}" multiple size="3">
        ${subclearances.map(sub => 
          `<option value="${sub}" ${selected.includes(sub) ? "selected" : ""}>${sub}</option>`
        ).join("")}
      </select>
    </label>
  `;
}

function toggleFile(i) {
  const el = document.getElementById(`file-${i}`);
  el.style.display = el.style.display === "none" ? "block" : "none";
}

function saveFile(i) {
  const content = document.getElementById(`edit-${i}`).value;
  const min = document.getElementById(`min-${i}`).value;
  const subs = Array.from(document.getElementById(`subs-${i}`).selectedOptions).map(o => o.value);

  files[i].content = content;
  files[i].minClearance = min;
  files[i].subclearances = subs;
  sessionStorage.setItem("classifiedFiles", JSON.stringify(files));
  render();
}

function deleteFile(i) {
  if (confirm("Delete this file?")) {
    files.splice(i, 1);
    sessionStorage.setItem("classifiedFiles", JSON.stringify(files));
    render();
  }
}

function createFile() {
  const title = document.getElementById("newTitle").value.trim();
  const content = document.getElementById("newContent").value.trim();
  const min = document.getElementById("newMin").value;
  const subs = Array.from(document.getElementById("newSubs").selectedOptions).map(o => o.value);

  if (!title || !content) {
    alert("All fields required.");
    return;
  }

  files.push({ title, content, minClearance: min, subclearances: subs });
  sessionStorage.setItem("classifiedFiles", JSON.stringify(files));
  render();
}

function logout() {
  if (confirm("Log out?")) {
    sessionStorage.clear();
    window.location.href = "index.html";
  }
}

render();
