const runBtn = document.getElementById("run-btn");
const clearBtn = document.getElementById("clear-btn");
const newFileBtn = document.getElementById("new-file-btn");

const saveBtn = document.getElementById("save-btn");
const loadBtn = document.getElementById("load-btn");
const downloadBtn = document.getElementById("download-btn");

const tabsList = document.getElementById("tabs-list");
const editorContainer = document.querySelector(".editor-container");

const previewFrame = document.getElementById("preview");

const newFileForm = document.getElementById("new-file-form");
const createFileBtn = document.getElementById("create-file-btn");
const cancelFileBtn = document.getElementById("cancel-file-btn");
const fileLanguageSelect = document.getElementById("file-language");
const fileNameInput = document.getElementById("file-name");

const fpsDisplay = document.getElementById("fps");

let files = [];
let activeFileId = null;

function initializeEditor() {
  if (files.length === 0) {
    createNewFile("index", "html");
  }
}

function createNewFile(name, language) {
  const id = Date.now();
  const extension = getExtension(language);
  let fileName = name.trim();
  const regex = new RegExp(`${extension}$`, 'i');
  if (!regex.test(fileName)) {
    fileName += extension;
  }
  const newFile = {
    id,
    name: fileName,
    language,
    content: ""
  };
  files.push(newFile);
  addTab(newFile);
  addEditor(newFile);
  setActiveFile(id);
  saveToLocalStorage();
}

function getExtension(language) {
  const extensions = {
    html: ".html",
    css: ".css",
    javascript: ".js",
    python: ".py",
    ruby: ".rb",
    typescript: ".ts",
    java: ".java",
    csharp: ".cs",
    php: ".php",
    go: ".go",
    swift: ".swift",
    kotlin: ".kt",
    rust: ".rs"
  };
  return extensions[language.toLowerCase()] || ".txt";
}

function addTab(file) {
  const li = document.createElement("li");
  li.textContent = file.name;
  li.setAttribute("data-id", file.id);
  li.classList.add("active");

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-tab";
  deleteBtn.title = "Delete File";
  deleteBtn.innerHTML = "&times;";
  li.appendChild(deleteBtn);

  li.addEventListener("click", (event) => {
    if (event.target.classList.contains('delete-tab')) return;
    setActiveFile(file.id);
  });

  tabsList.appendChild(li);
}

function addEditor(file) {
  const panel = document.createElement("div");
  panel.className = "editor-panel";
  panel.setAttribute("data-id", file.id);

  const header = document.createElement("div");
  header.className = "panel-header";
  header.textContent = file.name;

  const textarea = document.createElement("textarea");
  textarea.placeholder = `Write your ${file.language.toUpperCase()} code here...`;
  textarea.value = file.content;

  textarea.addEventListener("input", (event) => handleInput(event, file.id));

  panel.appendChild(header);
  panel.appendChild(textarea);
  editorContainer.appendChild(panel);
}

function setActiveFile(id) {
  activeFileId = id;
  Array.from(tabsList.children).forEach(li => {
    if (parseInt(li.getAttribute("data-id")) === id) {
      li.classList.add("active");
    } else {
      li.classList.remove("active");
    }
  });

  Array.from(editorContainer.children).forEach(panel => {
    if (parseInt(panel.getAttribute("data-id")) === id) {
      panel.classList.add("active");
    } else {
      panel.classList.remove("active");
    }
  });

  updatePreview();
}

function handleInput(event, fileId) {
  const textarea = event.target;
  const content = textarea.value;
  const fileIndex = files.findIndex(f => f.id === fileId);
  if (fileIndex !== -1) {
    files[fileIndex].content = content;
  }

  if (autoRunCheckbox.checked) {
    updatePreview();
  }

  saveToLocalStorage();
}

function saveToLocalStorage() {
  const data = {
    files,
    theme: getCurrentTheme()
  };
  localStorage.setItem("amazingEditorData", JSON.stringify(data));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem("amazingEditorData");
  if (saved) {
    const data = JSON.parse(saved);
    files = data.files || [];
    const theme = data.theme || 'dark';
    applyTheme(theme);

    tabsList.innerHTML = "";
    editorContainer.innerHTML = "";

    files.forEach(file => {
      addTab(file);
      addEditor(file);
    });

    if (files.length > 0) {
      setActiveFile(files[0].id);
    }

    alert("Loaded code and theme from LocalStorage!");
  } else {
    alert("No saved data found in LocalStorage.");
  }
}

function downloadAsFile() {
  if (!activeFileId) {
    alert("No active file to download.");
    return;
  }
  const file = files.find(f => f.id === activeFileId);
  if (!file) {
    alert("Active file not found.");
    return;
  }
  const blob = new Blob([file.content], { type: getMimeType(file.language) });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(link.href);
}

function getMimeType(language) {
  const mimeTypes = {
    html: "text/html",
    css: "text/css",
    javascript: "application/javascript",
    python: "text/x-python",
    ruby: "text/x-ruby",
    typescript: "application/typescript",
    java: "text/x-java-source",
    csharp: "text/plain",
    php: "application/x-httpd-php",
    go: "text/plain",
    swift: "text/x-swift",
    kotlin: "text/plain",
    rust: "text/plain"
  };
  return mimeTypes[language.toLowerCase()] || "text/plain";
}

function applyTheme(theme) {
  document.body.classList.remove('dark', 'light', 'solarized', 'dracula');
  document.body.classList.add(theme);
}

function getCurrentTheme() {
  if (document.body.classList.contains('dark')) return 'dark';
  if (document.body.classList.contains('light')) return 'light';
  if (document.body.classList.contains('solarized')) return 'solarized';
  if (document.body.classList.contains('dracula')) return 'dracula';
  return 'dark';
}

function handleRun() {
  const htmlFiles = files.filter(f => f.language.toLowerCase() === 'html');
  const cssFiles = files.filter(f => f.language.toLowerCase() === 'css');
  const jsFiles = files.filter(f => ['javascript', 'js'].includes(f.language.toLowerCase()));

  let combinedHTML = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><title>Preview</title>";

  cssFiles.forEach(file => {
    combinedHTML += `<style>${file.content}</style>`;
  });

  combinedHTML += "</head><body>";

  htmlFiles.forEach(file => {
    combinedHTML += file.content;
  });

  jsFiles.forEach(file => {
    combinedHTML += `<script>${file.content}<\/script>`;
  });

  combinedHTML += "</body></html>";

  const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  doc.open();
  doc.write(combinedHTML);
  doc.close();
}

function handleClear() {
  if (!activeFileId) {
    alert("No active file to clear.");
    return;
  }
  const fileIndex = files.findIndex(f => f.id === activeFileId);
  if (fileIndex !== -1) {
    if (confirm(`Are you sure you want to clear the content of ${files[fileIndex].name}?`)) {
      files[fileIndex].content = "";
      const activeEditor = document.querySelector(`.editor-panel[data-id="${activeFileId}"] textarea`);
      if (activeEditor) {
        activeEditor.value = "";
      }
      updatePreview();
      saveToLocalStorage();
    }
  }
}

function handleNewFile() {
  newFileForm.classList.add("active");
}

function handleCreateFile() {
  const language = fileLanguageSelect.value;
  const name = fileNameInput.value.trim();

  if (!name) {
    alert("Please enter a file name.");
    return;
  }

  const extension = getExtension(language);
  const regex = new RegExp(`${extension}$`, 'i');
  let baseName = name;

  if (regex.test(name)) {
    baseName = name.slice(0, -extension.length);
  }

  createNewFile(baseName, language);
  closeNewFileForm();
}

function handleCancelFile() {
  closeNewFileForm();
}

function closeNewFileForm() {
  newFileForm.classList.remove("active");
  fileNameInput.value = "";
  fileLanguageSelect.value = "html";
}

function updatePreview() {
  handleRun();
}

function deleteFile(id) {
  files = files.filter(file => file.id !== id);
  
  const tab = document.querySelector(`.tabs ul li[data-id="${id}"]`);
  if (tab) tab.remove();
  
  const panel = document.querySelector(`.editor-panel[data-id="${id}"]`);
  if (panel) panel.remove();
  
  if (activeFileId === id) {
    if (files.length > 0) {
      setActiveFile(files[0].id);
    } else {
      activeFileId = null;
      previewFrame.srcdoc = "<h2>No File Selected</h2>";
    }
  }
  
  saveToLocalStorage();
}

tabsList.addEventListener('click', function(event) {
  if (event.target.classList.contains('delete-tab')) {
    const li = event.target.parentElement;
    const id = parseInt(li.getAttribute('data-id'));
    const file = files.find(f => f.id === id);
    if (file && confirm(`Are you sure you want to delete ${file.name}?`)) {
      deleteFile(id);
    }
  }
});

let lastTime = performance.now();
let frames = 0;
let fps = 0;

function updateFPS(currentTime) {
  frames++;
  const delta = currentTime - lastTime;
  if (delta >= 1000) {
    fps = Math.round((frames * 1000) / delta);
    fpsDisplay.textContent = fps;
    frames = 0;
    lastTime = currentTime;
  }
  requestAnimationFrame(updateFPS);
}

requestAnimationFrame(updateFPS);

function initialize() {
  const saved = localStorage.getItem("amazingEditorData");
  if (saved) {
    const data = JSON.parse(saved);
    files = data.files || [];
    const theme = data.theme || 'dark';
    applyTheme(theme);

    tabsList.innerHTML = "";
    editorContainer.innerHTML = "";

    files.forEach(file => {
      addTab(file);
      addEditor(file);
    });

    if (files.length > 0) {
      setActiveFile(files[0].id);
    }

    alert("Loaded code and theme from LocalStorage!");
  } else {
    initializeEditor();
  }
}

runBtn.addEventListener("click", handleRun);
clearBtn.addEventListener("click", handleClear);
newFileBtn.addEventListener("click", handleNewFile);

createFileBtn.addEventListener("click", handleCreateFile);
cancelFileBtn.addEventListener("click", handleCancelFile);

saveBtn.addEventListener("click", saveToLocalStorage);
loadBtn.addEventListener("click", loadFromLocalStorage);
downloadBtn.addEventListener("click", downloadAsFile);

window.addEventListener("load", initialize);
