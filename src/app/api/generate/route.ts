import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Use environment variable or fallback to a free-tier key
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, systemPrompt, model, temperature, maxTokens } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in your .env.local file." },
        { status: 500 }
      );
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "ContentForge",
      },
      body: JSON.stringify({
        model: model || "openrouter/free",
        messages: [
          {
            role: "system",
            content: systemPrompt || "You are a helpful content generation assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: maxTokens || 2000,
        temperature: temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || `OpenRouter API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No content generated.";

    return NextResponse.json({ content, model: data.model });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
