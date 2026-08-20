import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

import Translation from "./models/Translation.js";
import User from "./models/User.js";

dotenv.config();

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ====================================
   EXPRESS APP INITIALIZATION
==================================== */
const app = express();

/* ====================================
   MIDDLEWARE SETUP
==================================== */
app.use(cors({
    origin: true,
    credentials: true
}));

// Payload limits for Zip uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static files
app.use(express.static(__dirname));
app.use(express.static("."));

/* ==========================================
   ENVIRONMENT CHECK
========================================== */
console.log("====================================");
console.log("Environment Status");
console.log("====================================");

console.log(
    process.env.MONGO_URI
        ? "✅ MongoDB URI Loaded"
        : "❌ MongoDB URI Missing"
);

console.log(
    (process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY)
        ? "✅ OpenRouter API Key Loaded"
        : "❌ OpenRouter API Key Missing"
);

console.log(
    process.env.JWT_SECRET
        ? "✅ JWT Secret Loaded"
        : "❌ JWT Secret Missing"
);

console.log("====================================");

/* ==========================================
   OPENROUTER CLIENT CONFIGURATION
========================================== */
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "https://ai-code-translator-4yje.onrender.com",
        "X-Title": "CodeMorph AI"
    }
});

/* ==========================================
   MONGODB CONNECTION
========================================== */
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed");
        console.error(error.message);
        process.exit(1);
    }
}

/* ==========================================
   AI HELPER FUNCTIONS
========================================== */
async function translateWithAI(sourceCode, sourceLang, targetLang) {
    try {
        const response = await openai.chat.completions.create({
            model: "openrouter/free",
            messages: [
                {
                    role: "system",
                    content: "You are an expert programming language translator. Return only the translated code without markdown or explanations."
                },
                {
                    role: "user",
                    content: `Translate the following ${sourceLang} code into ${targetLang}.\n\n${sourceCode}`
                }
            ],
            temperature: 0.2
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Translation Error:", error);
        throw new Error(
            error.message || "Unable to translate code."
        );
    }
}

async function explainCodeAI(code, language) {
    try {
        const response = await openai.chat.completions.create({
            model: "openrouter/free",
            messages: [
                {
                    role: "system",
                    content: "You are an expert programming tutor. Explain code in simple language."
                },
                {
                    role: "user",
                    content: `Explain this ${language} code step by step:\n\n${code}`
                }
            ],
            temperature: 0.3
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Explain Error:", error);
        throw new Error(
            error.message || "Unable to explain code."
        );
    }
}

async function analyzeCodeAI(sourceCode, language) {
    try {
        const response = await openai.chat.completions.create({
            model: "openrouter/free",
            messages: [
                {
                    role: "system",
                    content: "You are an expert software engineer. Find coding errors, explain them, and provide corrected code."
                },
                {
                    role: "user",
                    content: `Analyze this ${language} code.\n\nReturn your response in this format:\n\nErrors:\n...\n\nCorrected Code:\n...\n\nCode:\n\n${sourceCode}`
                }
            ],
            temperature: 0.2
        });

        const result = response.choices[0].message.content;
        let errors = result;
        let fixedCode = "";

        if (result.includes("Corrected Code:")) {
            const parts = result.split("Corrected Code:");
            errors = parts[0].replace("Errors:", "").trim();
            fixedCode = parts[1].trim();
        }

        return {
            errors,
            fixedCode
        };
    } catch (error) {
        console.error("Analyze Error:", error);
        throw new Error(
            error.message || "Unable to analyze code."
        );
    }
}

/* ==========================================
   ROUTES
========================================== */
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "🚀 CodeMorph AI Backend is Running"
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "OK",
        server: "Running",
        mongodb:
            mongoose.connection.readyState === 1
                ? "Connected"
                : "Disconnected"
    });
});

app.post("/translate", async (req, res) => {
    try {
        const { sourceCode, sourceLang, targetLang } = req.body;

        if (!sourceCode || !targetLang) {
            return res.status(400).json({
                success: false,
                error: "Source code and target language are required."
            });
        }

        const translatedCode = await translateWithAI(
            sourceCode,
            sourceLang || "Unknown",
            targetLang
        );

        res.status(200).json({
            success: true,
            translatedCode
        });
    } catch (error) {
        console.error("Translate Route Error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post("/analyze", async (req, res) => {
    try {
        const { sourceCode, sourceLang } = req.body;

        if (!sourceCode) {
            return res.status(400).json({
                success: false,
                error: "Source code is required."
            });
        }

        const result = await analyzeCodeAI(
            sourceCode,
            sourceLang || "Unknown"
        );

        res.status(200).json({
            success: true,
            errors: result.errors,
            fixedCode: result.fixedCode
        });
    } catch (error) {
        console.error("Analyze Route Error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post("/explain", async (req, res) => {
    try {
        const { code, language } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                error: "Code is required."
            });
        }

        const explanation = await explainCodeAI(
            code,
            language || "Unknown"
        );

        res.status(200).json({
            success: true,
            explanation
        });
    } catch (error) {
        console.error("Explain Route Error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: "Message is required."
            });
        }

        const response = await openai.chat.completions.create({
            model: "openrouter/free",
            messages: [
                {
                    role: "system",
                    content: "You are an expert AI programming assistant."
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.4
        });

        res.status(200).json({
            success: true,
            reply: response.choices[0].message.content.trim()
        });
    } catch (error) {
        console.error("Chat Route Error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: "All fields are required."
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: "User already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: "Registration Successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required."
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found."
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({
                success: false,
                error: "Invalid password."
            });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post("/api/translate-repo", async (req, res) => {
    const { fileTree, targetLanguage } = req.body;

    if (!fileTree || !Array.isArray(fileTree)) {
        return res.status(400).json({ error: "Invalid file tree structure." });
    }

    try {
        const extensionMap = {
            python: ".py",
            javascript: ".js",
            typescript: ".ts",
            java: ".java",
            cpp: ".cpp",
            csharp: ".cs"
        };

        const targetExt = extensionMap[targetLanguage?.toLowerCase()] || ".txt";

        const translatedFiles = await Promise.all(
            fileTree.map(async (file) => {
                const newPath = file.path.replace(/\.[^/.]+$/, targetExt);
                let newContent = file.content;
                
                if (targetLanguage === "python") {
                    newContent = newContent
                        .replace(/import\s+\{(.*?)\}\s+from\s+['"]\.\/(.*?)['"];?/g, "from $2 import $1")
                        .replace(/export\s+function\s+/g, "def ");
                }

                return { path: newPath, content: newContent };
            })
        );

        res.json({ translatedFiles });
    } catch (error) {
        console.error("AI Translation Error:", error);
        res.status(500).json({ error: "Failed to translate project files." });
    }
});

/* ==========================================
   START SERVER
========================================== */
async function startServer() {
    try {
        await connectDB();
        
        const PORT = process.env.PORT || 3000;

        app.listen(PORT, "0.0.0.0", () => {
            console.log("====================================");
            console.log("🚀 CodeMorph AI Server Started");
            console.log(`🌐 Port : ${PORT}`);
            console.log("====================================");
        });
    } catch (error) {
        console.error("Server Startup Error");
        console.error(error);
        process.exit(1);
    }
}

startServer();

/* ==========================================
   SHUTDOWN HANDLERS
========================================== */
process.on("SIGINT", async () => {
    console.log("\nStopping Server...");
    await mongoose.connection.close();
    console.log("MongoDB Connection Closed");
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("\nStopping Server...");
    await mongoose.connection.close();
    console.log("MongoDB Connection Closed");
    process.exit(0);
});
/* ==========================================
   SANDBOX CODE EXECUTION ROUTE
========================================== */
app.post("/run-sandbox", async (req, res) => {
    const { language, code } = req.body;

    if (!code || !code.trim()) {
        return res.status(400).json({ success: false, error: "No code provided." });
    }

    try {
        let output = "";

        // 1. Local JavaScript Execution
        if (language === "javascript") {
            let logs = [];
            const customConsole = {
                log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(" ")),
                error: (...args) => logs.push("ERROR: " + args.join(" ")),
                warn: (...args) => logs.push("WARN: " + args.join(" "))
            };

            const runInSandbox = new Function("console", code);
            runInSandbox(customConsole);

            output = logs.length > 0 ? logs.join("\n") : "Execution finished with no output.";
            return res.status(200).json({ success: true, output });
        }

        // 2. Remote Execution for Compiled Languages via Piston API
        const pistonLangMap = {
            "java": { language: "java", version: "15.0.2" },
            "cpp": { language: "c++", version: "10.2.0" },
            "csharp": { language: "csharp", version: "6.12.0" },
            "typescript": { language: "typescript", version: "5.0.3" }
        };

        const targetLang = pistonLangMap[language];

        if (!targetLang) {
            return res.status(400).json({ success: false, error: `Language '${language}' is not supported.` });
        }

        // Send code to Piston API
        const pistonResponse = await fetch("https://emkc.org/api/v2/piston/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                language: targetLang.language,
                version: targetLang.version,
                files: [{ content: code }]
            })
        });

        const pistonData = await pistonResponse.json();

        if (pistonData.run && pistonData.run.output) {
            output = pistonData.run.output;
        } else if (pistonData.message) {
            output = `Piston API Error: ${pistonData.message}`;
        } else {
            output = "Execution failed: No output returned from compiler.";
        }

        res.status(200).json({ success: true, output });

    } catch (error) {
        console.error("Sandbox Execution Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
