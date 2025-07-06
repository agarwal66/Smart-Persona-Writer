import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { persona, template, topic } = await req.json();

    const prompt = `
You are an AI writer helping generate a ${template} on the topic "${topic}".
Use the following persona:
- Name: ${persona.name}
- Tone: ${persona.tone}
- Style: ${persona.style}
- Domain: ${persona.domain}
Make sure your response matches this voice and style.
`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",  // ✅ Supported Groq model
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("❌ Groq API Error:", errorText);
      return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
    }

    const data = await groqResponse.json();
    const generated = data.choices?.[0]?.message?.content;

    return NextResponse.json({ result: generated || "❌ No content returned." });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Server error occurred." }, { status: 500 });
  }
}
