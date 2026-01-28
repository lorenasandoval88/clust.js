import {irisData,pca_plot } from "./dist/sdk.mjs"; // adjust path

// ======== EMBEDDED CONSOLE ========
const consoleOut = document.getElementById("consoleOut");

// Save original console methods
const originalConsole = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console)
};

// Function to display messages in custom console
function displayInConsole(args, type = "log") {
  if (!consoleOut) return;
  
  const line = document.createElement("div");
  line.className = `c-line c-${type}`;
  
  const text = args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (e) {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');
  
  line.textContent = text;
  consoleOut.appendChild(line);
  consoleOut.scrollTop = consoleOut.scrollHeight;
}

// Override console methods
console.log = (...args) => {
  originalConsole.log(...args);
  displayInConsole(args, 'log');
};

console.warn = (...args) => {
  originalConsole.warn(...args);
  displayInConsole(args, 'warn');
};

console.error = (...args) => {
  originalConsole.error(...args);
  displayInConsole(args, 'err');
};

// Console controls
document.getElementById("btnClearConsole")?.addEventListener("click", () => {
  if (consoleOut) consoleOut.innerHTML = "";
});

document.getElementById("btnCopyConsole")?.addEventListener("click", () => {
  if (consoleOut) {
    navigator.clipboard.writeText(consoleOut.textContent)
      .then(() => displayInConsole(['📋 Copied to clipboard'], 'meta'))
      .catch(() => displayInConsole(['Failed to copy'], 'err'));
  }
});

// Console command input with AsyncFunction support
document.getElementById("consoleCmd")?.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const cmd = e.target.value.trim();
    if (!cmd) return;
    
    displayInConsole([`> ${cmd}`], 'meta');
    
    try {
      // Create an async function that can use await
      const AsyncFunction = async function(){}.constructor;
      
      // Try as expression first (with return)
      let result;
      try {
        result = await AsyncFunction(`return (${cmd})`)();
      } catch (e1) {
        // If that fails, try as statement (without return)
        try {
          result = await AsyncFunction(cmd)();
        } catch (e2) {
          // If both fail, throw the original error
          throw e1;
        }
      }
      
      if (result !== undefined) {
        console.log(result);
      }
    } catch (err) {
      console.error(err.message);
    }
    
    e.target.value = "";
  }
});

// ======== APP STATE (GUI controls update this) ========
const appState = {
  data: null,         // array of objects (rows)
  source: null,       // "file" | "builtin"
  name: null          // filename or dataset name
};

// ======== IRIS (your built-in sample) ========
// const irisData = await fetch("./src/data/iris.json").then(r => r.json());

// ======== RIGHT PANEL TABLE RENDER ========
function renderTableRight(data, title = "Dataset Preview") {
  const container = document.getElementById("rightData");
  if (!container) return;

  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = `<div class="text-muted">No data to display.</div>`;
    return;
  }

  const cols = Object.keys(data[0]);

  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <div class="fw-semibold">${title}</div>
      <div class="text-muted small">${data.length} rows</div>
    </div>
  `;

  // Create scrollable wrapper
  const scrollWrapper = document.createElement("div");
  scrollWrapper.style.maxHeight = "200px";  // Height for ~5 rows
  scrollWrapper.style.overflowY = "auto";
  scrollWrapper.style.overflowX = "auto";

  const table = document.createElement("table");
  table.className = "table table-dark table-striped table-sm mb-0";

  const thead = document.createElement("thead");
  thead.style.position = "sticky";
  thead.style.top = "0";
  thead.style.backgroundColor = "#111111";
  thead.style.zIndex = "1";
  
  const hr = document.createElement("tr");
  cols.forEach(c => {
    const th = document.createElement("th");
    th.textContent = c.replaceAll("_", " ");
    hr.appendChild(th);
  });
  thead.appendChild(hr);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  // Display up to 500 rows
  const displayData = data.slice(0, 500);
  displayData.forEach(row => {
    const tr = document.createElement("tr");
    cols.forEach(c => {
      const td = document.createElement("td");
      td.textContent = row[c];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  scrollWrapper.appendChild(table);
  container.appendChild(scrollWrapper);
}

// ======== SIMPLE CSV/TSV PARSER ========
function parseDelimitedText(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0].split(delimiter).map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(delimiter);
    const obj = {};
    headers.forEach((h, i) => {
      const v = (values[i] ?? "").trim();
      const num = Number(v);
      obj[h] = v !== "" && Number.isFinite(num) ? num : v;
    });
    return obj;
  });
}

// ======== GUI: BUILT-IN DATASET SELECT ========
document.getElementById("builtinData")?.addEventListener("change", (e) => {
  const val = e.target.value;

  if (val === "iris") {
    appState.data = irisData;
    appState.source = "builtin";
    appState.name = "Iris";
    console.log("Built-in Iris data selected");
    renderTableRight(appState.data, "Iris (built-in)");
    document.getElementById("myPCA").innerHTML = ""; // optional: clear old plot
  }
});




// ======== GUI: LOAD FILE ========
document.getElementById("fileInput")?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    const text = evt.target.result;
    const data = parseDelimitedText(text);

    appState.data = data;
    appState.source = "file";
    appState.name = file.name;

    renderTableRight(appState.data, `Loaded file: ${file.name}`);
    document.getElementById("myPCA").innerHTML = ""; // optional: clear old plot
  };
  reader.readAsText(file);
});

// ======== PCA: CLICK TOOL BUTTON ========
document.getElementById("btnPCA")?.addEventListener("click", async () => {
  const data = appState.data;

  if (!data || data.length === 0) {
    renderTableRight([], "");
    const rightPanel = document.getElementById("rightData");
    if (rightPanel) {
      rightPanel.innerHTML = `
        <div class="text-muted">
          Load a file or select a built-in dataset (Iris) first.
        </div>
      `;
    }
    return;
  }

  //console.log(`Running PCA on ${data.length} rows from ${appState.source}: ${appState.name}`);


const el = document.getElementById("myPCA");

  // Use container size (with safe minimums)
  const width = Math.max(520, el.clientWidth - 24);
  const height = 460;

// Toggle the class in JS when you render/clear PCA plot so background stays white
  const p = document.getElementById("myPCA");
    if (p) {
    p.classList.add("has-plot");
    }

  await pca_plot({
    data,
    divid: "myPCA",
    width: width,
    height: height
  });
});


  //await pca_plot({})