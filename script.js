const accessCodes = {
  "sK1iU#@9o3": { level: 0 },
  "G*&c*2!5fM0%": { level: 1 },
  "y#6V9g^n6l0n5&": { level: 2 },
  "pu8Lb82gP@*U$11w": { level: 3 },
  "1V!zm@rlgsO%ZA9M&A": { level: 4 },
  "9l1!5MhF0g&7b6%uu$": { level: 5 },
  "ln!G91#10ArE4%%!hR8*": { level: "OVERRIDE" },
  "1g^X*v4@%J^N#gW#E5FS": { edit: true },

  // 🔑 Subclearance Passkeys
  "INT-987": { sub: "INTSEC" },
  "ETH-731": { sub: "ETHCOM" },
  "SIT-347": { sub: "SITADM" }
};

let userAccess = JSON.parse(sessionStorage.getItem("userAccess")) || {
  level: null,
  sub: [],
  edit: false
};

function mergeSubAccess(existing, incoming) {
  return [...new Set([...existing, ...incoming])];
}

function getLevelVal(level) {
  return level === "OVERRIDE" ? 6 : parseInt(level, 10);
}

function verifyCode() {
  const code = document.getElementById("accessCode").value.trim();
  const info = accessCodes[code];
  const feedback = document.getElementById("feedback");
  document.getElementById("accessCode").value = "";

  if (!info) {
    feedback.textContent = "❌ Invalid code.";
    return;
  }

  if (info.edit) {
    userAccess.edit = true;
  } else if (info.sub) {
    userAccess.sub = mergeSubAccess(userAccess.sub, [info.sub]);
  } else {
    const newLevel = getLevelVal(info.level);
    const currLevel = getLevelVal(userAccess.level);
    if (newLevel > currLevel) userAccess.level = info.level;
  }

  sessionStorage.setItem("userAccess", JSON.stringify(userAccess));
  feedback.textContent = "✅ Access updated.";

  if (!location.href.includes("dashboard.html")) {
    setTimeout(() => window.location.href = "dashboard.html", 500);
  } else {
    setTimeout(() => location.reload(), 300);
  }
}
