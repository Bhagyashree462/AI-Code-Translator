import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import OpenAI from "openai";

import Translation from "./models/Translation.js";
import User from "./models/User.js";


dotenv.config();


const app = express();


const openai = new OpenAI({

    apiKey: process.env.OPENAI_API_KEY

});


app.use(cors());

app.use(express.json());



console.log(
    "MongoDB:",
    process.env.MONGO_URI ? "Loaded" : "Missing"
);



/*
==========================================
MongoDB Connection
==========================================
*/


async function connectDB(){

    try{

        await mongoose.connect(
            process.env.MONGO_URI
        );


        console.log(
            "✅ MongoDB Connected Successfully"
        );


    }
    catch(error){

        console.log(
            "MongoDB Error:",
            error.message
        );

        process.exit(1);

    }

}



/*
==========================================
OpenAI Translation Function
==========================================
*/


async function translateWithAI(
    sourceCode,
    sourceLang,
    targetLang
){

try{


const completion =
await openai.chat.completions.create({

model:"gpt-4.1-mini",


messages:[


{

role:"system",

content:
"You are an expert code translator."

},


{

role:"user",

content:`

Convert this code.

Source Language:
${sourceLang}

Target Language:
${targetLang}


Rules:

- Return only code.
- No explanation.
- No markdown.
- Keep logic same.


Code:

${sourceCode}

`

}


]


});



return completion
.choices[0]
.message
.content

.replace(/```[a-zA-Z]*/g,"")
.replace(/```/g,"")
.trim();



}

catch(error){

console.log(
"Translation Error:",
error.message
);


throw error;


}

}



/*
==========================================
OpenAI Code Explanation Function
==========================================
*/


async function explainCodeAI(
code,
language
){

try{


const completion =
await openai.chat.completions.create({


model:"gpt-4.1-mini",


messages:[


{

role:"system",

content:
"You are an expert programming tutor."

},


{

role:"user",

content:`

Explain this ${language} code.

Give explanation:

1. Purpose
2. Variables and Functions
3. Logic Flow
4. Time Complexity
5. Space Complexity


Code:

${code}

`

}


]


});



return completion
.choices[0]
.message
.content;



}
catch(error){

console.log(
"Explanation Error:",
error.message
);


throw error;


}

}




/*
==========================================
OpenAI Code Analysis Function
==========================================
*/


async function analyzeCodeAI(
sourceCode,
sourceLang
){


try{


const completion =
await openai.chat.completions.create({


model:"gpt-4.1-mini",


messages:[


{

role:"system",

content:
"You are an expert debugging assistant."

},


{

role:"user",

content:`

Analyze this ${sourceLang} code.


Find:

1. Syntax errors
2. Logical errors
3. Corrected code


Return ONLY JSON:


{
"errors":"",
"fixedCode":""
}


Code:

${sourceCode}

`

}


]


});



let result =
completion
.choices[0]
.message
.content;



result=result
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();



return JSON.parse(result);



}
catch(error){


return {


errors:error.message,

fixedCode:sourceCode


};


}

}
/*
==========================================
Home Route
==========================================
*/

app.get("/", (req, res) => {

    res.send(
        "🚀 AI Code Translator Server is Running"
    );

});
/*
==========================================
Health Route
==========================================
*/

app.get("/health", (req, res) => {

    res.status(200).json({

        status: "OK",

        message: "Server is healthy"

    });

});
/*
==========================================
Translate Route
==========================================
*/


app.post("/translate", async(req,res)=>{


try{


const {

sourceCode,

sourceLang,

targetLang


}=req.body;



if(!sourceCode || !sourceLang || !targetLang){


return res.status(400).json({

error:
"sourceCode, sourceLang and targetLang are required"

});


}



const translatedCode =
await translateWithAI(

sourceCode,

sourceLang,

targetLang

);




await Translation.create({


sourceLang:

sourceLang,


targetLang:

targetLang,


inputCode:

sourceCode,


outputCode:

translatedCode


});




res.status(200).json({


translatedCode:

translatedCode


});



}

catch(error){


console.log(

"Translate Error:",

error.message

);



res.status(500).json({


error:

"Translation Failed",


details:

error.message


});



}


});
/*
==========================================
Explain Route
==========================================
*/


app.post("/explain", async(req,res)=>{


try{


const {


code,


language


}=req.body;




if(!code || !language){


return res.status(400).json({


error:

"Code and language are required"


});


}




const explanation =

await explainCodeAI(

code,

language

);




res.status(200).json({


explanation:

explanation


});



}

catch(error){


console.log(

"Explain Error:",

error.message

);



res.status(500).json({


error:

"Explanation Failed",


details:

error.message


});



}


});
/*
==========================================
Analyze Route
==========================================
*/


app.post("/analyze", async(req,res)=>{


try{


const {


sourceCode,


sourceLang


}=req.body;




if(!sourceCode || !sourceLang){


return res.status(400).json({


error:

"sourceCode and sourceLang are required"


});


}




const analysis =

await analyzeCodeAI(

sourceCode,

sourceLang

);




res.status(200).json({


errors:

analysis.errors,


fixedCode:

analysis.fixedCode


});



}

catch(error){


console.log(

"Analyze Error:",

error.message

);



res.status(500).json({


errors:

error.message,


fixedCode:

req.body.sourceCode || ""


});


}


});
/*
==========================================
History Route
==========================================
*/


app.get("/history", async(req,res)=>{


try{


const history =

await Translation.find()

.sort({

createdAt:-1

});



res.status(200).json(history);



}

catch(error){


console.log(

"History Error:",

error.message

);



res.status(500).json({


error:

"Failed to fetch history"


});


}


});
/*
==========================================
Register Route
==========================================
*/


app.post("/register", async(req,res)=>{


try{


const {


name,


email,


password


}=req.body;




if(!name || !email || !password){


return res.status(400).json({


error:

"All fields are required"


});


}





const existingUser =

await User.findOne({

email

});




if(existingUser){


return res.status(400).json({


error:

"User already exists"


});


}




const hashedPassword =

await bcrypt.hash(

password,

10

);





const user =

await User.create({


name,


email,


password:

hashedPassword


});





res.status(201).json({


message:

"Registration Successful",


user:{


id:user._id,


name:user.name,


email:user.email


}


});




}

catch(error){


console.log(

"Register Error:",

error.message

);



res.status(500).json({


error:

"Registration Failed"


});


}


});
/*
==========================================
Login Route
==========================================
*/


app.post("/login", async(req,res)=>{


try{


const {


email,


password


}=req.body;




if(!email || !password){


return res.status(400).json({


error:

"Email and Password are required"


});


}





const user =

await User.findOne({

email

});




if(!user){


return res.status(400).json({


error:

"User not found"


});


}





const isMatch =

await bcrypt.compare(

password,

user.password

);





if(!isMatch){


return res.status(400).json({


error:

"Invalid Password"


});


}





const token =

jwt.sign(


{

id:user._id,

email:user.email

},


process.env.JWT_SECRET,


{

expiresIn:"7d"

}


);





res.status(200).json({


message:

"Login Successful",


token,


user:{


id:user._id,


name:user.name,


email:user.email


}


});




}

catch(error){


console.log(

"Login Error:",

error.message

);



res.status(500).json({


error:

"Login Failed"


});


}


});
/*
==========================================
AI Chat Route
==========================================
*/


app.post("/chat", async(req,res)=>{


try{


const { message } = req.body;



if(!message){


return res.status(400).json({


reply:

"Message is required"


});


}




const completion =

await openai.chat.completions.create({


model:

"gpt-4.1-mini",



messages:[


{

role:"system",

content:

"You are a helpful AI coding assistant. Answer programming questions clearly."

},


{

role:"user",

content:

message

}


]


});





res.status(200).json({


reply:

completion
.choices[0]
.message
.content


});



}

catch(error){


console.log(

"Chat Error:",

error.message

);



res.status(500).json({


reply:

"AI server error"


});


}


});
/*
==========================================
Start Server
==========================================
*/


async function startServer(){


try{


await connectDB();



const PORT =

process.env.PORT || 5000;




app.listen(PORT,()=>{


console.log(

`🚀 Server running on port ${PORT}`

);


});



}

catch(error){


console.log(

"Server Startup Error:",

error.message

);


process.exit(1);


}


}



startServer();