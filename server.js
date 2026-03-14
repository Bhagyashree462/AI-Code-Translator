import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

/* =====================================
   HOME ROUTE (ADDED TO FIX ERROR)
===================================== */

app.get("/", (req, res) => {
    res.send("🚀 Multi Language Code Translator Server Running");
});

/* =====================================
   BASIC HELPERS
===================================== */

function removeCommonSyntax(code) {
    return code
        .replace(/;/g, "")
        .replace(/\{/g, "")
        .replace(/\}/g, "")
}

/* =====================================
   PYTHON CONVERSIONS
===================================== */

function pythonToJava(code) {
    return code
        .replace(/def (.*?):/g, "public static void $1 {")
        .replace(/print\((.*?)\)/g, "System.out.println($1);")
        .replace(/if (.*?):/g, "if($1) {")
        .replace(/else:/g, "else {")
        .replace(/for (.*?) in range\((.*?)\):/g,
            "for(int $1 = 0; $1 < $2; $1++) {");
}

function pythonToC(code) {
    return "#include <stdio.h>\n\n" +
        code
            .replace(/def (.*?):/g, "void $1 {")
            .replace(/print\((.*?)\)/g, 'printf("%s\\n", $1);')
            .replace(/if (.*?):/g, "if($1) {")
            .replace(/else:/g, "else {")
            .replace(/for (.*?) in range\((.*?)\):/g,
                "for(int $1 = 0; $1 < $2; $1++) {");
}

function pythonToJS(code) {
    return code
        .replace(/def (.*?):/g, "function $1 {")
        .replace(/print\((.*?)\)/g, "console.log($1);")
        .replace(/if (.*?):/g, "if($1) {")
        .replace(/else:/g, "else {")
        .replace(/for (.*?) in range\((.*?)\):/g,
            "for(let $1 = 0; $1 < $2; $1++) {");
}

function pythonToCpp(code) {
    return "#include <iostream>\nusing namespace std;\n\n" +
        code
            .replace(/def (.*?):/g, "void $1 {")
            .replace(/print\((.*?)\)/g, "cout << $1 << endl;")
            .replace(/if (.*?):/g, "if($1) {")
            .replace(/else:/g, "else {")
            .replace(/for (.*?) in range\((.*?)\):/g,
                "for(int $1 = 0; $1 < $2; $1++) {");
}

/* =====================================
   JAVA CONVERSIONS
===================================== */

function javaToPython(code) {
    return code
        .replace(/System\.out\.println\((.*?)\);/g, "print($1)")
        .replace(/public static void (.*?)\s*\{/g, "def $1:")
        .replace(/if\s*\((.*?)\)\s*\{/g, "if $1:")
        .replace(/else\s*\{/g, "else:")
        .replace(/for\s*\(int (.*?) = 0; \1 < (.*?); \1\+\+\)\s*\{/g,
            "for $1 in range($2):")
        .replace(/\}/g, "")
        .replace(/;/g, "");
}

function javaToC(code) {
    return "#include <stdio.h>\n\n" +
        code
            .replace(/System\.out\.println\((.*?)\);/g, 'printf("%s\\n", $1);')
            .replace(/public static void/g, "void");
}

function javaToJS(code) {
    return code
        .replace(/System\.out\.println\((.*?)\);/g, "console.log($1);")
        .replace(/public static void/g, "function");
}

function javaToCpp(code) {
    return "#include <iostream>\nusing namespace std;\n\n" +
        code
            .replace(/System\.out\.println\((.*?)\);/g, "cout << $1 << endl;");
}/* =====================================
   C CONVERSIONS (IMPROVED)
===================================== */

function cToPython(code) {
    return code
        .replace(/#include\s*<stdio\.h>/g, "")
        .replace(/int main\(\)\s*\{/g, "")
        .replace(/printf\("([^"]*)"\);/g, 'print("$1")')
        .replace(/printf\("%d\\n?",\s*(.*?)\);/g, "print($1)")
        .replace(/printf\("%s\\n?",\s*(.*?)\);/g, "print($1)")
        .replace(/\}/g, "")
        .replace(/;/g, "");
}

function cToJava(code) {
    return code
        .replace(/#include\s*<stdio\.h>/g, "")
        .replace(/int main\(\)/g, "public static void main(String[] args)")
        .replace(/printf\("([^"]*)"\);/g, 'System.out.println("$1");')
        .replace(/printf\("%d\\n?",\s*(.*?)\);/g, "System.out.println($1);")
        .replace(/printf\("%s\\n?",\s*(.*?)\);/g, "System.out.println($1);");
}

function cToJS(code) {
    return code
        .replace(/#include\s*<stdio\.h>/g, "")
        .replace(/int main\(\)/g, "function main()")
        .replace(/printf\("([^"]*)"\);/g, 'console.log("$1");')
        .replace(/printf\("%d\\n?",\s*(.*?)\);/g, "console.log($1);")
        .replace(/printf\("%s\\n?",\s*(.*?)\);/g, "console.log($1);");
}

function cToCpp(code) {
    return code
        .replace(/#include\s*<stdio\.h>/g,
            "#include <iostream>\nusing namespace std;")
        .replace(/printf\("([^"]*)"\);/g, 'cout << "$1" << endl;')
        .replace(/printf\("%d\\n?",\s*(.*?)\);/g, "cout << $1 << endl;")
        .replace(/printf\("%s\\n?",\s*(.*?)\);/g, "cout << $1 << endl;");
}
/* =====================================
   JAVASCRIPT CONVERSIONS
===================================== */

function jsToPython(code) {
    return code
        .replace(/console\.log\((.*?)\);/g, "print($1)")
        .replace(/function (.*?)\s*\{/g, "def $1:")
        .replace(/\}/g, "")
        .replace(/;/g, "");
}

function jsToJava(code) {
    return code
        .replace(/console\.log\((.*?)\);/g,
            "System.out.println($1);")
        .replace(/function/g, "public static void");
}

function jsToC(code) {
    return "#include <stdio.h>\n\n" +
        code
            .replace(/console\.log\((.*?)\);/g,
                'printf("%s\\n", $1);')
            .replace(/function/g, "void");
}

function jsToCpp(code) {
    return "#include <iostream>\nusing namespace std;\n\n" +
        code
            .replace(/console\.log\((.*?)\);/g,
                "cout << $1 << endl;")
            .replace(/function/g, "void");
}

/* =====================================
   TRANSLATION ROUTE
===================================== */

app.post("/translate", (req, res) => {

    let { sourceCode, sourceLang, targetLang } = req.body;

    sourceLang = sourceLang?.toLowerCase();
    targetLang = targetLang?.toLowerCase();

    let translated = "Translation not supported yet.";

    if (sourceLang === "python") {
        if (targetLang === "java") translated = pythonToJava(sourceCode);
        if (targetLang === "c") translated = pythonToC(sourceCode);
        if (targetLang === "javascript") translated = pythonToJS(sourceCode);
        if (targetLang === "c++") translated = pythonToCpp(sourceCode);
    }

    else if (sourceLang === "java") {
        if (targetLang === "python") translated = javaToPython(sourceCode);
        if (targetLang === "c") translated = javaToC(sourceCode);
        if (targetLang === "javascript") translated = javaToJS(sourceCode);
        if (targetLang === "c++") translated = javaToCpp(sourceCode);
    }

    else if (sourceLang === "c") {
        if (targetLang === "python") translated = cToPython(sourceCode);
        if (targetLang === "java") translated = cToJava(sourceCode);
        if (targetLang === "javascript") translated = cToJS(sourceCode);
        if (targetLang === "c++") translated = cToCpp(sourceCode);
    }

    else if (sourceLang === "javascript") {
        if (targetLang === "python") translated = jsToPython(sourceCode);
        if (targetLang === "java") translated = jsToJava(sourceCode);
        if (targetLang === "c") translated = jsToC(sourceCode);
        if (targetLang === "c++") translated = jsToCpp(sourceCode);
    }

    res.json({ translatedCode: translated });
});

/* =====================================
   SERVER START
===================================== */

app.listen(5000, () => {
    console.log("🚀 Server running on http://localhost:5000");
});