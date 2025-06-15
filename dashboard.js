const fileArea = document.getElementById("fileArea");
const infoDisplay = document.getElementById("accessInfo");

const access = JSON.parse(sessionStorage.getItem("userAccess")) || {};
const files = {
  "L3-INTSEC": "🗂️ L3 INTSEC File",
  "L3-ETHCOM": "📄 L3 ETHCOM Report",
  "L4-SITADM": "📂 L4 SITADM Logs",
  "L5-ETHCOM": "📝 L5 ETHCOM Protocol",
  "L5-SITADM": "🔒 L5 SITADM Blackfile"
};

function renderFiles() {
  fileArea.innerHTML = "";

  if (!access.level) {
    fileArea.innerHTML = "<p>🚫 No access granted.</p>";
    return;
  }

  infoDisplay.innerHTML = `
    <strong>Level:</strong> ${access.level} <br/>
    <strong>Subclearances:</strong> ${access.sub?.join(", ") || "None"}<br/>
    <strong>Edit Mode:</strong> ${access.edit ? "✅ ON" : "❌ OFF"}
  `;

  for (const key in files) {
    if (access.sub.includes(key)) {
      const box = document.createElement("div");
      box.className = "fileBox";
      box.innerHTML = `
        <h3>${key}</h3>
        <p>${files[key]}</p>
        ${access.edit ? `<textarea>${files[key]}</textarea>` : ""}
      `;
      fileArea.appendChild(box);
    }
  }
}

function verifyCode() {
  const newCode = document.getElementById("accessCode").value.trim();
  document.getElementById("accessCode").value = "";
  document.getElementById("feedback").textContent = "";

  // Fake a code submission by calling the same script
  document.getElementById("feedback").textContent = "Checking...";
  setTimeout(() => {
    window.location.href = "index.html"; // Let script.js handle re-auth
    sessionStorage.setItem("pendingCode", newCode);
  }, 500);
}

// If user lands here after redirecting with pending code
const pendingCode = sessionStorage.getItem("pendingCode");
if (pendingCode) {
  document.getElementById("accessCode").value = pendingCode;
  sessionStorage.removeItem("pendingCode");
  
}

renderFiles();
