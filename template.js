async function loadTemplates() {
  const url = "https://docs.google.com/spreadsheets/d/1tCPUDYOrlKpdnlahi03qscUQBvooBHPwYVUnxZVad2c/export?format=csv&gid=0";

  const res = await fetch(url);
  const csv = await res.text();

  const rows = parseCSV(csv);

  const templates = rows
    .map(([name, text]) => ({
      name: (name || "").trim(),
      text: (text || "").trim()
    }))
    .filter(row => row.name && row.text);

  return templates;
}

function parseCSV(csv) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;

      row.push(cell);
      cell = "";

      if (row.some(value => value.trim() !== "")) {
        rows.push(row);
      }

      row = [];
    } else {
      cell += char;
    }
  }

  // push last cell/row
  row.push(cell);
  if (row.some(value => value.trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

async function attachTemplateButton(targetElement, func) {
  if (!targetElement) return;
  if (targetElement.querySelector(".my-template-root")) return;

  const templates = await loadTemplates();
  
  injectTemplateStyles();

  if (!targetElement) return;
  if (targetElement.querySelector(".my-template-root")) return;

  const root = document.createElement("div");
  root.className = "my-template-root";

  const button = document.createElement("button");
  button.className = "my-template-button";
  button.type = "button";
  button.textContent = "📋 Templates";

  const panel = document.createElement("div");
  panel.className = "my-template-panel hidden";

  const list = document.createElement("div");
  list.className = "my-template-list";

  const preview = document.createElement("div");
  preview.className = "my-template-preview";
  preview.textContent = "Hover a template name to preview its text.";

  templates.forEach(template => {
    const item = document.createElement("div");
    item.className = "my-template-item";
    item.textContent = template.name;

    item.addEventListener("mouseenter", () => {
      preview.textContent = template.text;
    });

    item.addEventListener("mouseleave", () => {
      preview.textContent = "Hover a template name to preview its text.";
    });

    item.addEventListener("click", () => {
      console.log("Selected template:", template.name, template.text);
      // Put your action here, for example:
      // insertTemplateText(template.text);
      func(template.text)
      panel.classList.add("hidden");
    });

    list.appendChild(item);
  });

  button.addEventListener("click", e => {
    e.stopPropagation();
    panel.classList.toggle("hidden");
  });

  document.addEventListener("click", e => {
    if (!root.contains(e.target)) {
      panel.classList.add("hidden");
    }
  });

  panel.appendChild(list);
  panel.appendChild(preview);

  root.appendChild(button);
  root.appendChild(panel);

  targetElement.appendChild(root);
}

function applyTemplate(text){
    applyTemplateToNotes(text);
}

function injectTemplateStyles() {
  if (document.getElementById("my-template-styles")) return;

  const style = document.createElement("style");
  style.id = "my-template-styles";
  style.textContent = `
    .my-template-root {
      position: relative;
      display: inline-block;
      margin-left: 8px;
    }

    .my-template-button {
      cursor: pointer;
      border: 1px solid #ccc;
      background: white;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 14px;
    }

    .my-template-panel {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      z-index: 99999;
      display: flex;
      gap: 12px;
      width: 420px;
      max-height: 320px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 12px;
      background: white;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }

    .my-template-panel.hidden {
      display: none;
    }

    .my-template-list {
      width: 150px;
      min-width: 150px;
      border-right: 1px solid #eee;
      padding-right: 8px;
      overflow-y: auto;
    }

    .my-template-item {
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
      white-space: nowrap;
    }

    .my-template-item:hover {
      background: #f3f3f3;
    }

    .my-template-preview {
      flex: 1;
      white-space: pre-wrap;
      font-size: 13px;
      line-height: 1.4;
      color: #333;
      overflow-y: auto;
    }
  `;
  document.head.appendChild(style);
}