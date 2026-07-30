const API = "http://localhost:5000";

/* ===========================
   Detect Programming Language
=========================== */

function detectLanguage(code) {

    code = code.trim();

    if (code.includes("#include")) return "C";

    if (code.includes("using namespace")) return "C++";

    if (code.includes("System.out")) return "Java";

    if (code.includes("console.log")) return "JavaScript";

    if (
        code.includes("def ") ||
        code.includes("print(") ||
        code.includes("input(") ||
        code.includes("import ")
    ) return "Python";

    if (code.includes("using System")) return "C#";

    return "Unknown";
}
/* ===========================
   Translate Code
=========================== */

async function translateCode(){

    const code = document.getElementById("sourceCode").value;


    const target = document.getElementById("targetLang").value;


    const sourceLang = 
    document.getElementById("detectedLang").innerText;



    if(code.trim() === ""){

        alert("Please enter code");

        return;

    }


    if(sourceLang === "None" || sourceLang === "Unknown"){

        alert("Unable to detect programming language");

        return;

    }



    try{


        const response = await fetch(
            "http://localhost:5000/translate",
            {

            method:"POST",


            headers:{

                "Content-Type":"application/json"

            },


            body:JSON.stringify({

                sourceCode: code,

                sourceLang: sourceLang,

                targetLang: target

            })


        });



        const data = await response.json();



        if(data.translatedCode){

            document.getElementById("result").textContent =
            data.translatedCode;

        }

        else{

            document.getElementById("result").textContent =
            data.error || "Translation failed";

        }



    }

    catch(error){


        console.error(
            "Translation Error:",
            error
        );


        document.getElementById("result").textContent =
        "Server connection error";


    }


}/* ===========================
   Analyze Code
=========================== */

async function analyzeCode(){

    const code =
    document.getElementById("sourceCode").value;


    const sourceLang =
    document.getElementById("detectedLang").innerText;



    if(code.trim() === ""){

        alert("Enter code first");

        return;

    }



    try{


        const response = await fetch(
            "http://localhost:5000/analyze",
            {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },


            body:JSON.stringify({

                sourceCode: code,

                sourceLang: sourceLang

            })


        });



        const data = await response.json();



        document.getElementById("errorOutput").textContent =
        data.errors;



        document.getElementById("fixedCode").textContent =
        data.fixedCode;



    }

    catch(error){


        console.error(
            "Analyze Error:",
            error
        );


    }


}
/* ===========================
   Explain Code
=========================== */

async function explainCode(){


const code =
document.getElementById("sourceCode").value;


const language =
document.getElementById("detectedLang").innerText;



if(code.trim() === ""){

    alert("Enter code first");

    return;

}



try{


const response = await fetch(
"http://localhost:5000/explain",
{

method:"POST",

headers:{

"Content-Type":"application/json"

},


body:JSON.stringify({

code: code,

language: language

})


});



const data = await response.json();



document.getElementById("explanation").textContent =
data.explanation;



}

catch(error){


console.error(
"Explain Error:",
error
);


}


}
/* ===========================
   Copy Code
=========================== */

function copyCode() {

    navigator.clipboard.writeText(
        document.getElementById("result").textContent
    );

    alert("Copied Successfully");

}

/* ===========================
   Clear All
=========================== */

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

/* ===========================
   Download Code
=========================== */

function downloadCode() {

    const code = document.getElementById("result").textContent;

    const blob = new Blob([code], {
        type: "text/plain"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "translated_code.txt";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

}

/* ===========================
   AI Chat
=========================== */
// ================= AI CHAT ASSISTANT =================

async function sendChatMessage() {

    const input = document.getElementById("chatInput");
    const messages = document.getElementById("chatMessages");

    const userMessage = input.value.trim();

    if (userMessage === "") {
        alert("Please enter a message");
        return;
    }


    // Display user message

    messages.innerHTML += `
        <div class="chat-message user-message">
            <strong>👤 You:</strong>
            ${userMessage}
        </div>
    `;


    input.value = "";


    // Loading message

    messages.innerHTML += `
        <div class="chat-message bot-message" id="loading">
            <strong>🤖 AI:</strong>
            Thinking...
        </div>
    `;


    messages.scrollTop = messages.scrollHeight;


    try {


        const response = await fetch("http://localhost:5000/chat", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },


            body: JSON.stringify({

                message: userMessage

            })

        });



        const data = await response.json();


        document.getElementById("loading").remove();



        messages.innerHTML += `

            <div class="chat-message bot-message">

                <strong>🤖 AI:</strong>

                ${data.reply}

            </div>

        `;



    }

    catch(error) {


        document.getElementById("loading").remove();


        messages.innerHTML += `

        <div class="chat-message bot-message">

            <strong>🤖 AI:</strong>

            Server connection failed.

        </div>

        `;


        console.error(error);

    }


    messages.scrollTop = messages.scrollHeight;

}
// ================= LANGUAGE DETECTION =================

function detectLanguage() {

    const code = document.getElementById("sourceCode").value;

    const detected = document.getElementById("detectedLang");


    if (code.trim() === "") {

        detected.innerHTML = "None";

        return;

    }


    let language = "Unknown";


    // Python detection

    if (
        code.includes("def ") ||
        code.includes("import ") ||
        code.includes("print(") ||
        code.includes("elif ")
    ) {

        language = "Python";

    }


    // Java detection

    else if (
        code.includes("public class") ||
        code.includes("System.out.println") ||
        code.includes("public static void main")
    ) {

        language = "Java";

    }


    // JavaScript detection

    else if (
        code.includes("console.log") ||
        code.includes("function ") ||
        code.includes("const ") ||
        code.includes("let ")
    ) {

        language = "JavaScript";

    }


    // C detection

    else if (
        code.includes("#include <stdio.h>") ||
        code.includes("printf(")
    ) {

        language = "C";

    }


    // C++ detection

    else if (
        code.includes("#include <iostream>") ||
        code.includes("cout")
    ) {

        language = "C++";

    }


    detected.innerHTML = language;

}
/* ===========================
   Enter Key Support
=========================== */

document.getElementById("chatInput").addEventListener("keydown", function (e) {

    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        sendMessage();

    }

});
// ===============================
// AI VOICE COMMAND
// ===============================


function startVoice(){


const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;



if(!SpeechRecognition){


alert(
"Voice recognition is not supported. Use Google Chrome."
);


return;


}



const recognition =
new SpeechRecognition();



recognition.lang="en-US";


recognition.continuous=false;


recognition.interimResults=false;




recognition.start();



console.log(
"Listening..."
);




recognition.onstart=function(){


document.querySelector(".voice-btn").innerHTML=
"🎙 Listening...";


};





recognition.onresult=function(event){



let voiceText =
event.results[0][0].transcript;



console.log(
voiceText
);




document.getElementById(
"chatInput"
).value=voiceText;



document.querySelector(".voice-btn").innerHTML=
"🎤 Voice AI";



};






recognition.onerror=function(event){



console.log(
event.error
);



document.querySelector(".voice-btn").innerHTML=
"🎤 Voice AI";


alert(
"Voice error: "+event.error
);


};





recognition.onend=function(){


document.querySelector(".voice-btn").innerHTML=
"🎤 Voice AI";


};



}