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
    const lang = document.getElementById('sandboxLang')?.value || document.getElementById('sandboxLanguageSelect')?.value;
    const code = document.getElementById('sandboxCode')?.value || document.getElementById('sandboxCodeInput')?.value;
    const outputElem = document.getElementById('sandboxOutput') || document.getElementById('terminalOutput');

    if (!outputElem) return;

    if (!code || !code.trim()) {
        outputElem.textContent = "⚠️ Please enter or paste code to run.";
        return;
    }

    outputElem.textContent = "Running...";

    // 1. JavaScript Execution (Client-side)
    if (lang === 'javascript') {
        try {
            let logs = [];
            const originalLog = console.log;
            console.log = (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));

            const result = new Function(code)();
            console.log = originalLog;

            outputElem.textContent = logs.length > 0 
                ? logs.join('\n') 
                : (result !== undefined ? String(result) : 'Execution finished with no output.');
        } catch (err) {
            outputElem.textContent = "❌ Runtime Error: " + err.message;
        }
    } 
    // 2. Python Execution (Pyodide WebAssembly)
    else if (lang === 'python') {
        try {
            await initPyodide();
            let outputLogs = [];
            pyodideInstance.setStdout({ 
                batched: (str) => { outputLogs.push(str); } 
            });

            let result = await pyodideInstance.runPythonAsync(code);
            
            let outputText = outputLogs.join('\n');
            if (result !== undefined) {
                outputText += (outputText ? "\n" : "") + "Result: " + result;
            }

            outputElem.textContent = outputText || 'Execution finished with no output.';
        } catch (err) {
            outputElem.textContent = "❌ Python Error:\n" + err.message;
        }
    } 
    // 3. Compiled Languages Execution (Java, C++, C#, TypeScript via Server)
    else {
        try {
            outputElem.textContent = `⏳ Compiling and running ${lang.toUpperCase()}...`;

            const response = await fetch(`${window.location.origin}/run-sandbox`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ language: lang, code: code })
            });

            const data = await response.json();

            if (data.success) {
                outputElem.textContent = data.output || 'Execution finished with no output.';
            } else {
                outputElem.textContent = "❌ Execution Error:\n" + (data.error || "Unknown server error.");
            }
        } catch (err) {
            console.error("Server Sandbox Execution Error:", err);
            outputElem.textContent = "❌ Unable to connect to execution server.";
        }
    }
}
/* ==========================================
   GITHUB EXPORT FUNCTION
========================================== */

async function exportToGitHub() {
    const token = document.getElementById('githubToken')?.value.trim();
    const repo = document.getElementById('githubRepo')?.value.trim();
    const filePath = document.getElementById('githubFilePath')?.value.trim();

    // Your translated code is displayed inside #result
    const resultElement = document.getElementById('result');
    const content = resultElement?.textContent?.trim();

    const statusDiv = document.getElementById('githubStatus');

    // ------------------------------------------
    // Validate GitHub fields
    // ------------------------------------------
    if (!token || !repo || !filePath) {
        alert("Please fill in all GitHub export fields!");
        return;
    }

    // ------------------------------------------
    // Validate translated code
    // ------------------------------------------
    if (!content) {
        alert("No translated code available. Please translate your code first!");
        return;
    }

    // ------------------------------------------
    // Validate repository format
    // Example: Bhagyashree462/AI-Code-Translator
    // ------------------------------------------
    const repoParts = repo.split('/');

    if (repoParts.length !== 2 || !repoParts[0] || !repoParts[1]) {
        alert("Please enter the GitHub repository in this format:\nOwner/Repository");
        return;
    }

    const owner = repoParts[0].trim();
    const repoName = repoParts[1].trim();

    // ------------------------------------------
    // Create new branch name
    // ------------------------------------------
    const newBranchName = `codemorph-translate-${Date.now()}`;

    // ------------------------------------------
    // GitHub API headers
    // ------------------------------------------
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
    };

    // ------------------------------------------
    // Unicode-safe Base64 encoder
    // ------------------------------------------
    function encodeBase64(str) {
        const bytes = new TextEncoder().encode(str);

        let binary = '';

        const chunkSize = 0x8000;

        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode(...chunk);
        }

        return btoa(binary);
    }

    try {

        // ==========================================
        // STEP 1: Get repository information
        // ==========================================

        if (statusDiv) {
            statusDiv.style.color = '#00f2fe';
            statusDiv.textContent =
                "1/5 Fetching GitHub repository information...";
        }

        const repoRes = await fetch(
            `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}`,
            {
                method: 'GET',
                headers
            }
        );

        const repoData = await repoRes.json();

        if (!repoRes.ok) {
            throw new Error(
                repoData.message ||
                `GitHub repository error (${repoRes.status})`
            );
        }

        const defaultBranch = repoData.default_branch || 'main';


        // ==========================================
        // STEP 2: Get default branch SHA
        // ==========================================

        if (statusDiv) {
            statusDiv.textContent =
                "2/5 Fetching default branch information...";
        }

        const refRes = await fetch(
            `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/git/ref/heads/${encodeURIComponent(defaultBranch)}`,
            {
                method: 'GET',
                headers
            }
        );

        const refData = await refRes.json();

        if (!refRes.ok) {
            throw new Error(
                refData.message ||
                `Unable to fetch branch information (${refRes.status})`
            );
        }

        const baseSha = refData.object?.sha;

        if (!baseSha) {
            throw new Error("Could not find the default branch SHA.");
        }


        // ==========================================
        // STEP 3: Create new branch
        // ==========================================

        if (statusDiv) {
            statusDiv.textContent =
                "3/5 Creating new CodeMorph AI branch...";
        }

        const branchRes = await fetch(
            `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/git/refs`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    ref: `refs/heads/${newBranchName}`,
                    sha: baseSha
                })
            }
        );

        const branchData = await branchRes.json();

        if (!branchRes.ok) {
            throw new Error(
                branchData.message ||
                `Unable to create branch (${branchRes.status})`
            );
        }


        // ==========================================
        // STEP 4: Commit translated code
        // ==========================================

        if (statusDiv) {
            statusDiv.textContent =
                "4/5 Committing translated code...";
        }

        const encodedContent = encodeBase64(content);

        const fileUrl =
            `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/contents/${filePath
                .split('/')
                .map(part => encodeURIComponent(part))
                .join('/')}`;

        // Check whether the file already exists
        const existingFileRes = await fetch(
            `${fileUrl}?ref=${encodeURIComponent(newBranchName)}`,
            {
                method: 'GET',
                headers
            }
        );

        let existingFileSha = null;

        if (existingFileRes.ok) {
            const existingFileData = await existingFileRes.json();
            existingFileSha = existingFileData.sha || null;
        }

        const commitBody = {
            message: 'feat: Add CodeMorph AI translated code',
            content: encodedContent,
            branch: newBranchName
        };

        // If file already exists, GitHub requires its SHA
        if (existingFileSha) {
            commitBody.sha = existingFileSha;
        }

        const commitRes = await fetch(
            fileUrl,
            {
                method: 'PUT',
                headers,
                body: JSON.stringify(commitBody)
            }
        );

        const commitData = await commitRes.json();

        if (!commitRes.ok) {
            throw new Error(
                commitData.message ||
                `Unable to commit translated code (${commitRes.status})`
            );
        }


        // ==========================================
        // STEP 5: Create Pull Request
        // ==========================================

        if (statusDiv) {
            statusDiv.textContent =
                "5/5 Opening Pull Request...";
        }

        const prRes = await fetch(
            `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/pulls`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    title: '🤖 CodeMorph AI: Converted Code Integration',
                    head: newBranchName,
                    base: defaultBranch,
                    body:
                        'This PR contains automatically translated code generated by **CodeMorph AI**.'
                })
            }
        );

        const prData = await prRes.json();

        if (!prRes.ok) {
            throw new Error(
                prData.message ||
                `Unable to create Pull Request (${prRes.status})`
            );
        }


        // ==========================================
        // SUCCESS
        // ==========================================

        if (statusDiv) {
            statusDiv.style.color = '#00ff66';

            statusDiv.innerHTML = `
                ✅ Pull Request Created Successfully!<br>
                <a
                    href="${prData.html_url}"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="color:#00f2fe;"
                >
                    View PR #${prData.number}
                </a>
            `;
        }

        console.log("✅ GitHub Pull Request created:", prData.html_url);

    } catch (err) {

        console.error("❌ GitHub Export Error:", err);

        if (statusDiv) {
            statusDiv.style.color = '#ff4d4d';
            statusDiv.textContent =
                "❌ GitHub Export Failed: " + err.message;
        } else {
            alert("❌ GitHub Export Failed:\n" + err.message);
        }
    }
}


/* ==========================================
   SCRIPT LOADED
========================================== */

console.log("🚀 CodeMorph AI Script Loaded Successfully");