import 'dotenv/config'; // automatically loads your .env
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function test() {
  try {
    const response = await openai.models.list();
    console.log("API works! Models available:", response.data.map(m => m.id));
  } catch (err) {
    console.error("OpenAI API error:", err);
  }
}

test();
