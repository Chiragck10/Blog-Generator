import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash"];

function getGeminiUrl(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, systemPrompt, temperature, maxTokens } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please set GEMINI_API_KEY in your .env.local file." },
        { status: 500 }
      );
    }

    // Build request body for Gemini API
    const requestBody: Record<string, unknown> = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: temperature ?? 0.7,
        maxOutputTokens: maxTokens || 2000,
      },
    };

    if (systemPrompt) {
      requestBody.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    // Try models in order — fallback if one is overloaded or unavailable
    let lastError = "";
    for (const model of GEMINI_MODELS) {
      const response = await fetch(`${getGeminiUrl(model)}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        const content =
          data.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated.";
        return NextResponse.json({ content, model });
      }

      const errorData = await response.json().catch(() => ({}));
      lastError = errorData.error?.message || `Gemini API error: ${response.status}`;

      // If it's a rate limit / overload error, try next model
      if (response.status === 429 || response.status === 503) {
        continue;
      }

      // For other errors (auth, bad request), don't retry
      return NextResponse.json({ error: lastError }, { status: response.status });
    }

    // All models failed
    return NextResponse.json(
      { error: lastError || "All models are currently overloaded. Please try again in a minute." },
      { status: 503 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
