import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return NextResponse.json({ error: "API Key not configured correctly in .env.local" }, { status: 500 });
  }

  try {
    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Analyze the following note content and provide:
      1. A concise summary (max 2 sentences).
      2. A list of 3-5 relevant tags.

      Note content:
      "${content}"

      Respond strictly in JSON format:
      {
        "summary": "...",
        "tags": ["tag1", "tag2", ...]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    let data;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Text:", text);
      data = { 
        summary: text.substring(0, 150) + "...", 
        tags: ["ai-generated"] 
      };
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("FULL AI ERROR:", error);
    return NextResponse.json({ 
      error: "Failed to generate AI content", 
      details: error.message 
    }, { status: 500 });
  }
}
