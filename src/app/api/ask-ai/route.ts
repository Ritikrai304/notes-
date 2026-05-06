
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { query, notes } = await req.json();

    if (!query || !notes || !Array.isArray(notes)) {
      return NextResponse.json({ error: "Query and notes are required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const notesContext = notes.map(n => `ID: ${n.id}\nTitle: ${n.title}\nContent: ${n.content}`).join("\n---\n");

    const prompt = `
      You are an AI assistant helping a user find relevant notes from their collection.
      
      User Query: "${query}"

      Here are the user's notes:
      ${notesContext}

      Based on the query, identify which notes are most relevant. 
      Respond ONLY with a JSON array of the IDs of the relevant notes, in order of relevance.
      If no notes are relevant, return an empty array [].
      Example response: ["id1", "id2"]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[.*\]/s);
    const relevantIds = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ relevantIds });
  } catch (error: any) {
    console.error("Ask AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
