
// With your Render backend URL:
const API = "https://ai-code-translator-4yje.onrender.com";
/* ==========================================
   DETECT PROGRAMMING LANGUAGE
========================================== */

function detectLanguage() {

    const code = document.getElementById("sourceCode").value.trim();
    const detected = document.getElementById("detectedLang");

    if (!code) {
        detected.textContent = "None";
        return;
    }

    let language = "Unknown";

    if (
        code.includes("def ") ||
        code.includes("print(") ||
        code.includes("input(") ||
        code.includes("import ") ||
        code.includes("elif ")
    ) {

        language = "Python";

    }

    else if (

        code.includes("public class") ||
        code.includes("public static void main") ||
        code.includes("System.out.println")

    ) {

        language = "Java";

    }

    else if (

        code.includes("console.log") ||
        code.includes("function ") ||
        code.includes("const ") ||
        code.includes("let ") ||
        code.includes("=>")

    ) {

        language = "JavaScript";

    }

    else if (

        code.includes("#include <iostream>") ||
        code.includes("using namespace std") ||
        code.includes("cout")

    ) {

        language = "C++";

    }

    else if (

        code.includes("#include <stdio.h>") ||
        code.includes("printf(")

    ) {

        language = "C";

    }

    else if (

        code.includes("using System") ||
        code.includes("Console.WriteLine")

    ) {

        language = "C#";

    }

    detected.textContent = language;

}

/* ==========================================
   TRANSLATE CODE
========================================== */

async function translateCode() {

    const sourceCode = document.getElementById("sourceCode").value.trim();

    const targetLang = document.getElementById("targetLang").value;

    detectLanguage();

    const sourceLang = document.getElementById("detectedLang").textContent;

    if (!sourceCode) {

        alert("Please enter source code.");

        return;

    }

    try {

        document.getElementById("result").textContent =
            "Translating...";

        const response = await fetch(`${API}/translate`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                sourceCode,
                sourceLang,
                targetLang

            })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error || "Translation failed."
            );

        }

        document.getElementById("result").textContent =
            data.translatedCode || "No translated code received.";

    }

    catch (error) {

        console.error(error);

        document.getElementById("result").textContent =
            error.message;

    }

}

/* ==========================================
   ANALYZE CODE
========================================== */

async function analyzeCode() {

    const sourceCode =
        document.getElementById("sourceCode").value.trim();

    detectLanguage();

    const sourceLang =
        document.getElementById("detectedLang").textContent;

    if (!sourceCode) {

        alert("Please enter code.");

        return;

    }

    try {

        const response = await fetch(`${API}/analyze`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                sourceCode,
                sourceLang

            })

        });

        const data = await response.json();

        document.getElementById("errorOutput").textContent =
            data.errors || "No issues found.";

        document.getElementById("fixedCode").textContent =
            data.fixedCode || "No suggestions.";

    }

    catch (error) {

        console.error(error);

        document.getElementById("errorOutput").textContent =
            "Analyze failed.";

    }

}

/* ==========================================
   EXPLAIN CODE
========================================== */

async function explainCode() {

    const code =
        document.getElementById("sourceCode").value.trim();

    detectLanguage();

    const language =
        document.getElementById("detectedLang").textContent;

    if (!code) {

        alert("Please enter code.");

        return;

    }

    try {

        const response = await fetch(`${API}/explain`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                code,
                language

            })

        });

        const data = await response.json();

        document.getElementById("explanation").textContent =
            data.explanation || "No explanation available.";

    }

    catch (error) {

        console.error(error);

        document.getElementById("explanation").textContent =
            "Explanation failed.";

    }

}
/* ==========================================
   COPY CODE
========================================== */

function copyCode() {

    const result = document.getElementById("result").textContent;

    if (!result || result.trim() === "") {
        alert("Nothing to copy.");
        return;
    }

    navigator.clipboard.writeText(result)
        .then(() => {
            alert("Code copied successfully.");
        })
        .catch((error) => {
            console.error("Copy Error:", error);
            alert("Unable to copy code.");
        });

}

/* ==========================================
   CLEAR ALL
========================================== */

function clearAll() {

    document.getElementById("sourceCode").value = "";

    document.getElementById("result").textContent =
        "// Translation will appear here...";

    document.getElementById("errorOutput").textContent =
        "No errors detected.";

    document.getElementById("fixedCode").textContent =
        "Corrected code will appear here...";

    document.getElementById("explanation").textContent =
        "Explanation will appear here...";

    document.getElementById("detectedLang").textContent =
        "None";

}

/* ==========================================
   DOWNLOAD CODE
========================================== */
function downloadCode() {
    // 1. Get code content from your output element
    const codeElement = document.getElementById("result");
    const codeText = codeElement ? (codeElement.innerText || codeElement.textContent) : "";
    if (!codeText || codeText.trim() === "") {
        alert("There is no translated code to download!");
        return;
    }

    // 2. Get target language selection
    const targetLangSelect = document.getElementById("targetLang");
    const selectedLang = targetLangSelect ? targetLangSelect.value.toLowerCase() : "";

    // 3. Map language names/keys to file extensions
    const extensionMap = {
        python: "py",
        py: "py",
        javascript: "js",
        js: "js",
        typescript: "ts",
        ts: "ts",
        c: "c",
        cpp: "cpp",
        "c++": "cpp",
        csharp: "cs",
        "c#": "cs",
        java: "java",
        html: "html",
        css: "css",
        php: "php",
        ruby: "rb",
        go: "go",
        rust: "rs",
        swift: "swift",
        kotlin: "kt",
        sql: "sql",
        json: "json",
        shell: "sh",
        bash: "sh"
    };

    // 4. Determine extension or fallback to .txt
    const extension = extensionMap[selectedLang] || "txt";
    const filename = `translated_code.${extension}`;

    // 5. Trigger automatic file download
    const blob = new Blob([codeText], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}
/* ==========================================
   AI CHAT
========================================== */

async function sendChatMessage() {

    const input = document.getElementById("chatInput");
    const messages = document.getElementById("chatMessages");

    const userMessage = input.value.trim();

    if (!userMessage) {

        alert("Please enter a message.");

        return;

    }

    messages.innerHTML += `
        <div class="chat-message user-message">
            <strong>👤 You:</strong><br>
            ${userMessage}
        </div>
    `;

    input.value = "";

    messages.innerHTML += `
        <div class="chat-message bot-message" id="loading">
            <strong>🤖 AI:</strong><br>
            Thinking...
        </div>
    `;

    messages.scrollTop = messages.scrollHeight;

    try {

        const response = await fetch(`${API}/chat`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                message: userMessage

            })

        });

        const data = await response.json();

        const loading = document.getElementById("loading");

        if (loading) {

            loading.remove();

        }

        messages.innerHTML += `
            <div class="chat-message bot-message">
                <strong>🤖 AI:</strong><br>
                ${data.reply || "No response received."}
            </div>
        `;

    }

    catch (error) {

        console.error("Chat Error:", error);

        const loading = document.getElementById("loading");

        if (loading) {

            loading.remove();

        }

        messages.innerHTML += `
            <div class="chat-message bot-message">
                <strong>🤖 AI:</strong><br>
                Unable to connect to the server.
            </div>
        `;

    }

    messages.scrollTop = messages.scrollHeight;

}

/* ==========================================
   ENTER KEY SUPPORT
========================================== */

const chatInput = document.getElementById("chatInput");

if (chatInput) {

    chatInput.addEventListener("keydown", function (e) {

        if (e.key === "Enter" && !e.shiftKey) {

            e.preventDefault();

            sendChatMessage();

        }

    });

}
/* ==========================================
   AI VOICE COMMAND
========================================== */

function startVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert("Voice recognition is not supported in this browser.\nPlease use Google Chrome.");

        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {

        const btn = document.querySelector(".voice-btn");

        if (btn) {

            btn.innerHTML = "🎙 Listening...";

            btn.disabled = true;

        }

        console.log("Voice recognition started...");

    };

    recognition.onresult = function (event) {

        const transcript = event.results[0][0].transcript;

        console.log("Voice Input:", transcript);

        const input = document.getElementById("chatInput");

        if (input) {

            input.value = transcript;

            input.focus();

        }

    };

    recognition.onerror = function (event) {

        console.error("Voice Error:", event.error);

        alert("Voice Recognition Error: " + event.error);

    };

    recognition.onend = function () {

        const btn = document.querySelector(".voice-btn");

        if (btn) {

            btn.innerHTML = "🎤 Voice AI";

            btn.disabled = false;

        }

    };

    recognition.start();

}

/* ==========================================
   PAGE INITIALIZATION
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    console.log("✅ CodeMorph AI Loaded Successfully");

    const sourceCode = document.getElementById("sourceCode");

    if (sourceCode) {

        sourceCode.addEventListener("input", detectLanguage);

    }

    const result = document.getElementById("result");

    if (result) {

        result.textContent = "// Translation will appear here...";

    }

    const explanation = document.getElementById("explanation");

    if (explanation) {

        explanation.textContent = "Explanation will appear here...";

    }

    const errorOutput = document.getElementById("errorOutput");

    if (errorOutput) {

        errorOutput.textContent = "No errors detected.";
        
    }

    const fixedCode = document.getElementById("fixedCode");

    if (fixedCode) {

        fixedCode.textContent = "Corrected code will appear here...";

    }

});

/* ==========================================
   GLOBAL ERROR HANDLER
========================================== */

window.addEventListener("error", function (event) {

    console.error("JavaScript Error:", event.message);

});

/* ==========================================
   UNHANDLED PROMISE REJECTION
========================================== */

window.addEventListener("unhandledrejection", function (event) {

    console.error("Unhandled Promise:", event.reason);

});
const toggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');

// Check saved preference or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });
}

function setTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeIcon) themeIcon.textContent = '🌙';
    if (themeText) themeText.textContent = 'Dark Mode';
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeIcon) themeIcon.textContent = '☀️';
    if (themeText) themeText.textContent = 'Light Mode';
    localStorage.setItem('theme', 'dark');
  }
}
async function processZipUpload() {
  const fileInput = document.getElementById('zipFileInput');
  const targetLang = document.getElementById('targetLanguageSelect').value;
  const statusDiv = document.getElementById('conversionStatus');

  if (!fileInput.files.length) {
    alert('Please select a .zip file first!');
    return;
  }

  const file = fileInput.files[0];
  const zip = new JSZip();

  try {
    statusDiv.textContent = "Reading zip archive...";
    const loadedZip = await zip.loadAsync(file);
    const fileTree = [];

    // Extract all text files from the zip
    for (const [relativePath, zipEntry] of Object.entries(loadedZip.files)) {
      if (!zipEntry.dir && !relativePath.includes('node_modules') && !relativePath.startsWith('.')) {
        const content = await zipEntry.async('string');
        fileTree.push({
          path: relativePath,
          content: content
        });
      }
    }

    statusDiv.textContent = "Sending project files to AI for dependency mapping & translation...";

    // Send file tree to backend
    const response = await fetch('/api/translate-repo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileTree: fileTree,
        targetLanguage: targetLang
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Translation failed.');
    }

    statusDiv.textContent = "Packing converted files into new zip archive...";

    // Generate new Zip archive with converted code
    const outputZip = new JSZip();
    data.translatedFiles.forEach(file => {
      outputZip.file(file.path, file.content);
    });

    // Generate zip blob and trigger download
    const zipBlob = await outputZip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `translated_${targetLang}_project.zip`);

    statusDiv.textContent = "✅ Conversion complete! Your download has started.";
  } catch (error) {
    console.error('Error during conversion:', error);
    statusDiv.textContent = "❌ Error processing project: " + error.message;
  }
}

let pyodideInstance = null;

// Initialize Pyodide on page load
async function initPyodide() {
  if (!pyodideInstance) {
    const outputElem = document.getElementById('sandboxOutput');
    outputElem.textContent = "Loading Python WebAssembly runtime...";
    pyodideInstance = await loadPyodide();
    outputElem.textContent = "Python runtime ready!";
  }
}

async function runSandboxCode() {
  const lang = document.getElementById('sandboxLang').value;
  const code = document.getElementById('sandboxCode').value;
  const outputElem = document.getElementById('sandboxOutput');

  outputElem.textContent = "Running...";

  if (lang === 'javascript') {
    try {
      // Capture console.log output
      let logs = [];
      const originalLog = console.log;
      console.log = (...args) => logs.push(args.join(' '));

      // Execute JS code safely
      const result = new Function(code)();
      
      console.log = originalLog; // Restore original console.log
      outputElem.textContent = logs.length > 0 ? logs.join('\n') : (result !== undefined ? result : 'Execution finished with no output.');
    } catch (err) {
      outputElem.textContent = "❌ Runtime Error: " + err.message;
    }
  } else if (lang === 'python') {
    try {
      await initPyodide();
      
      // Redirect Python stdout to output element
      pyodideInstance.setStdout({
        batched: (str) => { outputElem.textContent = str; }
      });

      let result = await pyodideInstance.runPythonAsync(code);
      if (result !== undefined) {
        outputElem.textContent += "\nResult: " + result;
      }
    } catch (err) {
      outputElem.textContent = "❌ Python Error:\n" + err.message;
    }
  }
}
async function exportToGitHub() {
  const token = document.getElementById('githubToken').value;
  const repo = document.getElementById('githubRepo').value; // e.g., "owner/repo"
  const filePath = document.getElementById('githubFilePath').value;
  const content = document.getElementById('sandboxCode').value; // Code snippet to push
  const statusDiv = document.getElementById('githubStatus');

  if (!token || !repo || !filePath || !content) {
    alert("Please fill in all GitHub export fields!");
    return;
  }

  const [owner, repoName] = repo.split('/');
  const newBranchName = `codemorph-translate-${Date.now()}`;
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  try {
    statusDiv.style.color = '#00f2fe';
    statusDiv.textContent = "1/4 Fetching default branch info...";

    // 1. Get default branch (main/master) SHA
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers });
    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || 'main';

    const refRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${defaultBranch}`, { headers });
    const refData = await refRes.json();
    const baseSha = refData.object.sha;

    // 2. Create a new branch
    statusDiv.textContent = "2/4 Creating new feature branch...";
    await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${newBranchName}`,
        sha: baseSha
      })
    });

    // 3. Commit translated file to the new branch (base64 encoded)
    statusDiv.textContent = "3/4 Committing translated code...";
    await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: 'feat: Add CodeMorph AI translated code',
        content: btoa(content), // Base64 encoding
        branch: newBranchName
      })
    });

    // 4. Create Pull Request
    statusDiv.textContent = "4/4 Opening Pull Request...";
    const prRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/pulls`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: '🤖 CodeMorph AI: Converted Code Integration',
        head: newBranchName,
        base: defaultBranch,
        body: 'This PR contains automatically translated code generated by **CodeMorph AI**.'
      })
    });

    const prData = await prRes.json();
    statusDiv.style.color = '#00ff66';
    statusDiv.innerHTML = `✅ Pull Request Created! <a href="${prData.html_url}" target="_blank" style="color:#00f2fe;">View PR #${prData.number}</a>`;

  } catch (err) {
    console.error(err);
    statusDiv.style.color = '#ff4d4d';
    statusDiv.textContent = "❌ GitHub Export Failed: " + err.message;
  }
}
console.log("🚀 CodeMorph AI Script Loaded");