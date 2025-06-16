// Load session data
let access = JSON.parse(sessionStorage.getItem("userAccess")) || {
  level: null,
  sub: [],
  edit: false
};

let files = []; // Loaded from GitHub

const fileArea = document.getElementById("fileArea");
const infoDisplay = document.getElementById("accessInfo");

const GITHUB_USER = "JohnDoe7123";
const REPO = "RAISADatabase";
const BRANCH = "main";

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
               <button onclick="stageFile(${i})">🚀 Stage File to GitHub</button>`
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
      <button onclick="createFile()">➕ Stage New File</button>
    `;
    fileArea.appendChild(creator);
  }
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

// Create new file object and push to GitHub staging
function createFile() {
  const title = document.getElementById("newTitle").value.trim();
  const content = document.getElementById("newContent").value.trim();
  const min = document.getElementById("newMin").value;
  const subs = Array.from(document.getElementById("newSubs").selectedOptions).map(o => o.value);

  if (!title || !content) {
    alert("All fields required.");
    return;
  }

  const fileObj = {
    title,
    content,
    minClearance: min,
    subclearances: subs
  };

  const filename = `${title.replace(/\s+/g, '_')}.json`;
  pushToGitHub(filename, fileObj);
}

// Save file edits to staging
function stageFile(i) {
  const file = files[i];
  const content = document.getElementById(`edit-${i}`).value;
  const min = document.getElementById(`min-${i}`).value;
  const subs = Array.from(document.getElementById(`subs-${i}`).selectedOptions).map(o => o.value);

  const fileObj = {
    title: file.title,
    content,
    minClearance: min,
    subclearances: subs
  };

  const filename = `${file.title.replace(/\s+/g, '_')}.json`;
  pushToGitHub(filename, fileObj);
}

// Push to GitHub staging folder
async function pushToGitHub(filename, fileObj) {
  const path = `staging/${filename}`;
  const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(fileObj, null, 2))));

  const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO}/contents/${path}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${access.githubToken || "NO_TOKEN"}`, // DO NOT use this in public repo, just placeholder
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `Stage file ${filename}`,
      content: contentBase64,
      branch: BRANCH
    })
  });

  const result = await res.json();
  if (res.status === 201 || res.status === 200) {
    alert("✅ File staged! It will be published by GitHub Action.");
  } else {
    console.error(result);
    alert("❌ Failed to push file to GitHub staging.");
  }
}

// Logout
function logout() {
  if (confirm("Log out?")) {
    sessionStorage.clear();
    window.location.href = "index.html";
  }
}

// Load published files from /files folder on GitHub
async function loadFilesFromRepo() {
  const res = await fetch(`https://raw.githubusercontent.com/${GITHUB_USER}/${REPO}/${BRANCH}/files/`);
  const list = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO}/contents/files`);
  const json = await list.json();

  const filePromises = json
    .filter(file => file.name.endsWith(".json"))
    .map(file => fetch(file.download_url).then(r => r.json()));

  files = await Promise.all(filePromises);
  render();
}

loadFilesFromRepo();

}

render();
