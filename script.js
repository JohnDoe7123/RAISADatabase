const accessCodes = {
  "sK1iU#@9o3": { level: 0 },
  "G*&c*2!5fM0%": { level: 1 },
  "y#6V9g^n6l0n5&": { level: 2 },
  "pu8Lb82gP@*U$11w": { level: 3, sub: ["L3-INTSEC", "L3-ETHCOM", "L3-SITADM"] },
  "1V!zm@rlgsO%ZA9M&A": { level: 4, sub: ["L3-INTSEC", "L3-ETHCOM", "L3-SITADM", "L4-INTSEC", "L4-ETHCOM", "L4-SITADM"] },
  "9l1!5MhF0g&7b6%uu$": { level: 5, sub: ["L3-INTSEC", "L3-ETHCOM", "L3-SITADM", "L4-INTSEC", "L4-ETHCOM", "L4-SITADM", "L5-INTSEC", "L5-ETHCOM", "L5-SITADM"] },
  "ln!G91#10ArE4%%!hR8*": { level: "OVERRIDE", sub: ["L3-INTSEC", "L3-ETHCOM", "L3-SITADM", "L4-INTSEC", "L4-ETHCOM", "L4-SITADM", "L5-INTSEC", "L5-ETHCOM", "L5-SITADM"] },
  "1g^X*v4@%J^N#gW#E5FS": { edit: true }
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
  return level === "OVERRIDE" ? 6 : parseInt(level);
}

function verifyCode() {
  const code = document.getElementById("accessCode").value.trim();
  const info = accessCodes[code];
  const feedback = document.getElementById("feedback");

  if (!info) {
    feedback.textContent = "❌ Invalid code.";
    return;
  }

  if (info.edit) {
    userAccess.edit = true;
  } else {
    const newLevel = getLevelVal(info.level);
    const currLevel = getLevelVal(userAccess.level);
    if (newLevel > currLevel) userAccess.level = info.level;
    if (info.sub) userAccess.sub = mergeSubAccess(userAccess.sub, info.sub);
  }

  sessionStorage.setItem("userAccess", JSON.stringify(userAccess));
  feedback.textContent = "✅ Access granted. Redirecting...";
  setTimeout(() => window.location.href = "dashboard.html", 1000);
}
