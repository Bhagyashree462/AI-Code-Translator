// test.js

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function testAPI() {
  try {

    console.log("🚀 Testing API...\n");

    const response = await fetch(
      "http://localhost:5000/translate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sourceCode: "print('Hello World')",
          sourceLang: "python",
          targetLang: "java"
        })
      }
    );

    console.log("📌 Status Code:", response.status);

    const data = await response.json();

    console.log("\n📌 Response:");
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {

    console.log("❌ FULL ERROR:");
    console.log(error.message);

  }
}

testAPI();