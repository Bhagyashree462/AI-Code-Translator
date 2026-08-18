// With your Render backend URL:
const API = "https://ai-code-translator-4yje.onrender.com";

/* ==========================================
   USER AUTHENTICATION (REGISTER & LOGIN)
========================================== */
/* ==========================================
   USER AUTHENTICATION (REGISTER & LOGIN)
========================================== */

// Dynamically sets host URL (works locally and in production)
const API_BASE = window.location.origin;

document.addEventListener("DOMContentLoaded", function () {
    // 1. Registration Form Handler
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault(); // Prevents page reload / ?# in URL

            const name = document.getElementById("nameInput")?.value;
            const email = document.getElementById("emailInput")?.value;
            const password = document.getElementById("passwordInput")?.value;

            try {
                // Route updated to match backend route: /register
                const response = await fetch(`${API_BASE}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("✅ Account created successfully! Redirecting to login page...");
                    window.location.href = "login.html"; // Redirect to login
                } else {
                    alert("❌ Registration failed: " + (data.error || data.message || "Unknown error"));
                }
            } catch (error) {
                console.error("Registration Error:", error);
                alert("❌ Unable to connect to server during registration.");
            }
        });
    }

    // 2. Login Form Handler
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const email = document.getElementById("loginEmail")?.value;
            const password = document.getElementById("loginPassword")?.value;

            try {
                // Route updated to match backend route: /login
                const response = await fetch(`${API_BASE}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.token) {
                        localStorage.setItem("authToken", data.token);
                    }
                    alert("✅ Login successful! Redirecting to dashboard...");
                    window.location.href = "dashboard.html"; // Redirect to main app
                } else {
                    alert("❌ Login failed: " + (data.error || data.message || "Invalid credentials"));
                }
            } catch (error) {
                console.error("Login Error:", error);
                alert("❌ Unable to connect to server during login.");
            }
        });
    }
});
/* ==========================================
   DETECT PROGRAMMING LANGUAGE
========================================== */

function detectLanguage() {
    const code = document.getElementById("sourceCode")?.value.trim();
    const detected = document.getElementById("detectedLang");

    if (!detected) return;

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
    } else if (
        code.includes("public class") ||
        code.includes("public static void main") ||
        code.includes("System.out.println")
    ) {
        language = "Java";
    } else if (
        code.includes("console.log") ||
        code.includes("function ") ||
        code.includes("const ") ||
        code.includes("let ") ||
        code.includes("=>")
    ) {
        language = "JavaScript";
    } else if (
        code.includes("#include <iostream>") ||
        code.includes("using namespace std") ||
        code.includes("cout")
    ) {
        language = "C++";
    } else if (
        code.includes("#include <stdio.h>") ||
        code.includes("printf(")
    ) {
        language = "C";
    } else if (
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
    const sourceCode = document.getElementById("sourceCode")?.value.trim();
    const targetLang = document.getElementById("targetLang")?.value;

    detectLanguage();

    const sourceLang = document.getElementById("detectedLang")?.textContent;

    if (!sourceCode) {
        alert("Please enter source code.");
        return;
    }

    try {
        document.getElementById("result").textContent = "Translating...";

        const response = await fetch(`${API}/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sourceCode, sourceLang, targetLang })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Translation failed.");
        }

        document.getElementById("result").textContent =
            data.translatedCode || "No translated code received.";
    } catch (error) {
        console.error(error);
        document.getElementById("result").textContent = error.message;
    }
}

/* ==========================================
   ANALYZE CODE
========================================== */

async function analyzeCode() {
    const sourceCode = document.getElementById("sourceCode")?.value.trim();

    detectLanguage();

    const sourceLang = document.getElementById("detectedLang")?.textContent;

    if (!sourceCode) {
        alert("Please enter code.");
        return;
    }

    try {
        const response = await fetch(`${API}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sourceCode, sourceLang })
        });

        const data = await response.json();

        document.getElementById("errorOutput").textContent =
            data.errors || "No issues found.";

        document.getElementById("fixedCode").textContent =
            data.fixedCode || "No suggestions.";
    } catch (error) {
        console.error(error);
        document.getElementById("errorOutput").textContent = "Analyze failed.";
    }
}

/* ==========================================
   EXPLAIN CODE
========================================== */

async function explainCode() {
    const code = document.getElementById("sourceCode")?.value.trim();

    detectLanguage();

    const language = document.getElementById("detectedLang")?.textContent;

    if (!code) {
        alert("Please enter code.");
        return;
    }

    try {
        const response = await fetch(`${API}/explain`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, language })
        });

        const data = await response.json();

        document.getElementById("explanation").textContent =
            data.explanation || "No explanation available.";
    } catch (error) {
        console.error(error);
        document.getElementById("explanation").textContent = "Explanation failed.";
    }
}

/* ==========================================
   COPY CODE
========================================== */

function copyCode() {
    const result = document.getElementById("result")?.textContent;

    if (!result || result.trim() === "") {
        alert("Nothing to copy.");
        return;
    }

    navigator.clipboard.writeText(result)
        .then(() => alert("Code copied successfully."))
        .catch((error) => {
            console.error("Copy Error:", error);
            alert("Unable to copy code.");
        });
}

/* ==========================================
   CLEAR ALL
========================================== */

function clearAll() {
    if (document.getElementById("sourceCode")) document.getElementById("sourceCode").value = "";
    if (document.getElementById("result")) document.getElementById("result").textContent = "// Translation will appear here...";
    if (document.getElementById("errorOutput")) document.getElementById("errorOutput").textContent = "No errors detected.";
    if (document.getElementById("fixedCode")) document.getElementById("fixedCode").textContent = "Corrected code will appear here...";
    if (document.getElementById("explanation")) document.getElementById("explanation").textContent = "Explanation will appear here...";
    if (document.getElementById("detectedLang")) document.getElementById("detectedLang").textContent = "None";
}

/* ==========================================
   DOWNLOAD CODE
========================================== */

function downloadCode() {
    const codeElement = document.getElementById("result");
    const codeText = codeElement ? (codeElement.innerText || codeElement.textContent) : "";

    if (!codeText || codeText.trim() === "") {
        alert("There is no translated code to download!");
        return;
    }

    const targetLangSelect = document.getElementById("targetLang");
    const selectedLang = targetLangSelect ? targetLangSelect.value.toLowerCase() : "";

    const extensionMap = {
        python: "py", py: "py",
        javascript: "js", js: "js",
        typescript: "ts", ts: "ts",
        c: "c", cpp: "cpp", "c++": "cpp",
        csharp: "cs", "c#": "cs",
        java: "java", html: "html", css: "css",
        php: "php", ruby: "rb", go: "go",
        rust: "rs", swift: "swift", kotlin: "kt",
        sql: "sql", json: "json", shell: "sh", bash: "sh"
    };

    const extension = extensionMap[selectedLang] || "txt";
    const filename = `translated_code.${extension}`;

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

    if (!input || !messages) return;

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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage })
        });

        const data = await response.json();
        const loading = document.getElementById("loading");
        if (loading) loading.remove();

        messages.innerHTML += `
            <div class="chat-message bot-message">
                <strong>🤖 AI:</strong><br>
                ${data.reply || "No response received."}
            </div>
        `;
    } catch (error) {
        console.error("Chat Error:", error);
        const loading = document.getElementById("loading");
        if (loading) loading.remove();

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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

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
    };

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
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
    if (result) result.textContent = "// Translation will appear here...";

    const explanation = document.getElementById("explanation");
    if (explanation) explanation.textContent = "Explanation will appear here...";

    const errorOutput = document.getElementById("errorOutput");
    if (errorOutput) errorOutput.textContent = "No errors detected.";

    const fixedCode = document.getElementById("fixedCode");
    if (fixedCode) fixedCode.textContent = "Corrected code will appear here...";
});

/* ==========================================
   GLOBAL ERROR HANDLERS
========================================== */

window.addEventListener("error", function (event) {
    console.error("JavaScript Error:", event.message);
});

window.addEventListener("unhandledrejection", function (event) {
    console.error("Unhandled Promise:", event.reason);
});

/* ==========================================
   THEME TOGGLE SYSTEM
========================================== */

const toggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');

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

/* ==========================================
   ZIP FILE CONVERSION
========================================== */

/* ==========================================
   ZIP FILE CONVERSION
========================================== */

async function processZipUpload() {
    const fileInput = document.getElementById('zipFileInput');
    const targetLang = document.getElementById('targetLanguageSelect')?.value;
    const statusDiv = document.getElementById('conversionStatus');

    if (!fileInput || !fileInput.files.length) {
        alert('Please select a .zip file first!');
        return;
    }

    const file = fileInput.files[0];
    const zip = new JSZip();

    try {
        if (statusDiv) statusDiv.textContent = "Reading zip archive...";
        const loadedZip = await zip.loadAsync(file);
        const fileTree = [];

        for (const [relativePath, zipEntry] of Object.entries(loadedZip.files)) {
            if (!zipEntry.dir && !relativePath.includes('node_modules') && !relativePath.startsWith('.')) {
                const content = await zipEntry.async('string');
                fileTree.push({ path: relativePath, content: content });
            }
        }

        if (statusDiv) statusDiv.textContent = "Sending project files to AI...";

        const response = await fetch(`${API}/api/translate-repo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileTree, targetLanguage: targetLang })
        });

        // Safe Response Handling (prevents "Unexpected token '<'" JSON syntax error)
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const rawText = await response.text();
            throw new Error(`Server returned non-JSON response (${response.status}). Please check backend endpoint route and logs.`);
        }

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Translation failed.');

        if (statusDiv) statusDiv.textContent = "Packing converted files into new zip archive...";

        const outputZip = new JSZip();
        data.translatedFiles.forEach(f => outputZip.file(f.path, f.content));

        const zipBlob = await outputZip.generateAsync({ type: "blob" });
        saveAs(zipBlob, `translated_${targetLang}_project.zip`);

        if (statusDiv) statusDiv.textContent = "✅ Conversion complete! Your download has started.";
    } catch (error) {
        console.error('Error during conversion:', error);
        if (statusDiv) statusDiv.textContent = "❌ Error processing project: " + error.message;
    }
}
/* ==========================================
   SANDBOX CODE RUNNER
========================================== */

let pyodideInstance = null;

async function initPyodide() {
    if (!pyodideInstance) {
        const outputElem = document.getElementById('sandboxOutput');
        if (outputElem) outputElem.textContent = "Loading Python WebAssembly runtime...";
        pyodideInstance = await loadPyodide();
        if (outputElem) outputElem.textContent = "Python runtime ready!";
    }
}

async function runSandboxCode() {
    const lang = document.getElementById('sandboxLang')?.value;
    const code = document.getElementById('sandboxCode')?.value;
    const outputElem = document.getElementById('sandboxOutput');

    if (!outputElem) return;

    outputElem.textContent = "Running...";

    if (lang === 'javascript') {
        try {
            let logs = [];
            const originalLog = console.log;
            console.log = (...args) => logs.push(args.join(' '));

            const result = new Function(code)();
            console.log = originalLog;

            outputElem.textContent = logs.length > 0 ? logs.join('\n') : (result !== undefined ? result : 'Execution finished with no output.');
        } catch (err) {
            outputElem.textContent = "❌ Runtime Error: " + err.message;
        }
    } else if (lang === 'python') {
        try {
            await initPyodide();
            pyodideInstance.setStdout({ batched: (str) => { outputElem.textContent = str; } });

            let result = await pyodideInstance.runPythonAsync(code);
            if (result !== undefined) outputElem.textContent += "\nResult: " + result;
        } catch (err) {
            outputElem.textContent = "❌ Python Error:\n" + err.message;
        }
    }
}

/* ==========================================
   GITHUB EXPORT FUNCTION
========================================== */

async function exportToGitHub() {
    const token = document.getElementById('githubToken')?.value;
    const repo = document.getElementById('githubRepo')?.value;
    const filePath = document.getElementById('githubFilePath')?.value;
    const content = document.getElementById('sandboxCode')?.value;
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
        if (statusDiv) {
            statusDiv.style.color = '#00f2fe';
            statusDiv.textContent = "1/4 Fetching default branch info...";
        }

        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers });
        const repoData = await repoRes.json();
        const defaultBranch = repoData.default_branch || 'main';

        const refRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${defaultBranch}`, { headers });
        const refData = await refRes.json();
        const baseSha = refData.object.sha;

        if (statusDiv) statusDiv.textContent = "2/4 Creating new feature branch...";
        await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/refs`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ ref: `refs/heads/${newBranchName}`, sha: baseSha })
        });

        if (statusDiv) statusDiv.textContent = "3/4 Committing translated code...";
        await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                message: 'feat: Add CodeMorph AI translated code',
                content: btoa(content),
                branch: newBranchName
            })
        });

        if (statusDiv) statusDiv.textContent = "4/4 Opening Pull Request...";
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
        if (statusDiv) {
            statusDiv.style.color = '#00ff66';
            statusDiv.innerHTML = `✅ Pull Request Created! <a href="${prData.html_url}" target="_blank" style="color:#00f2fe;">View PR #${prData.number}</a>`;
        }
    } catch (err) {
        console.error(err);
        if (statusDiv) {
            statusDiv.style.color = '#ff4d4d';
            statusDiv.textContent = "❌ GitHub Export Failed: " + err.message;
        }
    }
}

console.log("🚀 CodeMorph AI Script Loaded Successfully");