const input = document.getElementById("inputText");
const count = document.getElementById("count");
const sampleBtn = document.getElementById("sampleBtn");
const clearBtn = document.getElementById("clearBtn");
const correctBtn = document.getElementById("correctBtn");
const copyBtn = document.getElementById("copyBtn");
const correctedText = document.getElementById("correctedText");
const summary = document.getElementById("summary");
const insights = document.getElementById("insights");
const changesSection = document.getElementById("changesSection");
const changesList = document.getElementById("changesList");
const changeCount = document.getElementById("changeCount");
const message = document.getElementById("message");

function updateCount() {
  const text = input.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  count.textContent = `${words} word${words === 1 ? "" : "s"}`;
}

function showMessage(text) {
  message.textContent = text;
  message.classList.remove("hidden");
}

function hideMessage() {
  message.classList.add("hidden");
}

sampleBtn.addEventListener("click", () => {
  input.value = "i recieved teh mesage yesterday and dont know wich file you want me to send. I can send it tomorow.";
  updateCount();
  hideMessage();
});

clearBtn.addEventListener("click", () => {
  input.value = "";
  updateCount();
  correctedText.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">✦</div>
      <strong>Your improved text will appear here</strong>
      <span>Enter a message and click “Improve Text”.</span>
    </div>`;
  summary.classList.add("hidden");
  insights.classList.add("hidden");
  changesSection.classList.add("hidden");
  hideMessage();
});

input.addEventListener("input", updateCount);

correctBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) {
    showMessage("Please enter some text first.");
    input.focus();
    return;
  }

  hideMessage();
  correctBtn.disabled = true;
  correctBtn.textContent = "Improving...";

  try {
    // Works with the Flask server. If the page is opened with Live Server,
    // the local fallback below keeps the demo functional too.
    let data;
    try {
      const response = await fetch("http://127.0.0.1:5000/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!response.ok) throw new Error("API unavailable");
      data = await response.json();
    } catch {
      data = localFallback(text);
    }

    renderResult(data);
  } catch (error) {
    showMessage("Something went wrong. Please try again.");
  } finally {
    correctBtn.disabled = false;
    correctBtn.textContent = "✦ Improve Text";
  }
});

copyBtn.addEventListener("click", async () => {
  const text = correctedText.innerText.trim();
  if (!text || text.includes("Your improved text will appear here")) return;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copied";
    setTimeout(() => copyBtn.textContent = "Copy", 1200);
  } catch {
    showMessage("Copy is not available in this browser.");
  }
});

function renderResult(data) {
  correctedText.textContent = data.corrected;

  const n = data.changes.length;
  summary.textContent = n
    ? `${n} improvement${n === 1 ? "" : "s"} detected in your text.`
    : "No obvious spelling, grammar, or formatting issues were found.";
  summary.classList.remove("hidden");

  let spelling = 0, grammar = 0, format = 0;
  data.changes.forEach(c => {
    if (c.type === "spelling") spelling++;
    else if (c.type === "grammar/spelling") grammar++;
    else format++;
  });

  document.getElementById("spellingCount").textContent = spelling;
  document.getElementById("grammarCount").textContent = grammar;
  document.getElementById("formatCount").textContent = format;

  const score = Math.max(70, 100 - n * 4);
  document.getElementById("score").textContent = score;
  document.getElementById("scoreBar").style.width = `${score}%`;
  insights.classList.remove("hidden");

  changeCount.textContent = `${n} change${n === 1 ? "" : "s"}`;
  changesList.innerHTML = "";

  if (!n) {
    changesList.innerHTML = `<div class="no-changes">Your text already looks polished.</div>`;
  } else {
    data.changes.forEach(c => {
      const item = document.createElement("div");
      item.className = "change-item";
      item.innerHTML = `
        <div class="change-row">
          <span class="old">${escapeHtml(c.original)}</span>
          <span class="arrow">→</span>
          <span class="new">${escapeHtml(c.corrected)}</span>
        </div>
        <div class="change-type">${escapeHtml(c.type)}</div>
      `;
      changesList.appendChild(item);
    });
  }

  changesSection.classList.remove("hidden");
}

function localFallback(text) {
  const rules = {
    "teh": "the", "recieve": "receive", "seperate": "separate",
    "definately": "definitely", "occured": "occurred", "acommodate": "accommodate",
    "enviroment": "environment", "untill": "until", "tomorow": "tomorrow",
    "thier": "their", "wich": "which", "wierd": "weird",
    "dont": "don't", "cant": "can't", "wont": "won't",
    "doesnt": "doesn't", "didnt": "didn't", "isnt": "isn't",
    "wasnt": "wasn't", "werent": "weren't"
  };

  const changes = [];
  let corrected = text.replace(/\b[A-Za-z']+\b/g, word => {
    const key = word.toLowerCase();
    if (rules[key]) {
      const fixed = preserveCase(word, rules[key]);
      changes.push({ original: word, corrected: fixed, type: "spelling" });
      return fixed;
    }
    return word;
  });

  corrected = corrected.replace(/\bi\b/g, "I");
  corrected = corrected.replace(/\s+([,.!?])/g, "$1");
  corrected = corrected.replace(/([,.!?])([A-Za-z])/g, "$1 $2");
  corrected = corrected.replace(/^\s+|\s+$/g, "");
  if (corrected) corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);

  return { original: text, corrected, changes: uniqueChanges(changes) };
}

function preserveCase(original, fixed) {
  if (original === original.toUpperCase()) return fixed.toUpperCase();
  if (original.charAt(0) === original.charAt(0).toUpperCase()) {
    return fixed.charAt(0).toUpperCase() + fixed.slice(1);
  }
  return fixed;
}

function uniqueChanges(changes) {
  const seen = new Set();
  return changes.filter(item => {
    const key = `${item.original}|${item.corrected}|${item.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function escapeHtml(value) {
  const d = document.createElement("div");
  d.textContent = value;
  return d.innerHTML;
}

updateCount();
