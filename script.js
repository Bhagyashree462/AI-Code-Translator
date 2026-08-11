
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

console.log("🚀 CodeMorph AI Script Loaded");