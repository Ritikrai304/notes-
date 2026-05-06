import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return NextResponse.json({ error: "API Key not configured correctly in .env.local" }, { status: 500 });
  }

  try {
    const { content, image } = await req.json();
    
    if (!content && !image) {
      return NextResponse.json({ error: "No content or image provided" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using gemini-2.0-flash as it's the most compatible for both text and vision
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let prompt = "";
    let result;

    if (image) {
      // Vision request
      prompt = "Extract all text from this image clearly and accurately. If there are headings, preserve them. Just return the extracted text.";
      const imageData = {
        inlineData: {
          data: image.split(",")[1], // Remove the data:image/png;base64, part
          mimeType: "image/jpeg" // Default to jpeg, but ideally should match source
        }
      };
      result = await model.generateContent([prompt, imageData]);
    } else {
      // Text processing request
      prompt = `
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
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    const text = response.text();

    if (image) {
      // For image, we just return the extracted text
      return NextResponse.json({ extractedText: text });
    }
    
    // For text processing, we parse JSON
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
    let errorMessage = error.message || "Failed to generate AI content";
    
    // Check for specific Gemini errors
    if (errorMessage.includes("API_KEY_INVALID")) {
      errorMessage = "Invalid Gemini API Key. Please check your .env.local file.";
    } else if (errorMessage.includes("429") || errorMessage.includes("QUOTA_EXCEEDED")) {
      errorMessage = "API Limit (Quota) khatam ho gayi hai. Please 30-60 seconds baad dobara try karein.";
    } else if (errorMessage.includes("PERMISSION_DENIED") && errorMessage.includes("leaked")) {
      errorMessage = "Ye API Key leak ho chuki hai aur Google ne ise block kar diya hai. Nayi key use karein.";
    }

    return NextResponse.json({ 
      error: errorMessage,
      details: error.message 
    }, { status: 500 });
  }
}
