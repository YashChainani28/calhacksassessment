import { NextResponse } from "next/server";

type ChatRequest = {
  message?: string;
  context?: string;
  history?: { role: "user" | "assistant"; content: string }[];
};

export async function POST(request: Request) {
  const body = (await request.json()) as ChatRequest;
  const message = body.message?.trim();
  const context = body.context || "Limits and derivatives lesson.";
  const history = body.history || [];

  if (!message) {
    return NextResponse.json({ reply: "Please ask a question." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply:
        "The OpenAI API key is missing. Set OPENAI_API_KEY in your environment."
    });
  }

  const systemPrompt = [
    "You are a friendly high school math tutor.",
    "Be encouraging, concise, and intuition-focused.",
    "Avoid providing full solutions unless explicitly asked.",
    "Use short paragraphs, ask quick check-in questions when helpful.",
    `Current lesson context: ${context}`
  ].join(" ");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...history
      ],
      max_tokens: 180,
      temperature: 0.4
    })
  });

  if (!response.ok) {
    return NextResponse.json({
      reply: "I could not reach the tutor right now. Try again soon."
    });
  }

  const data = await response.json();
  const reply =
    data?.choices?.[0]?.message?.content?.trim() ||
    "I can try another explanation. What part feels unclear?";

  return NextResponse.json({ reply });
}
