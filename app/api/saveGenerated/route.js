import { connectToDB } from "@/utils/db";
import Generated from "@/models/generated"; // create this model

export async function POST(req) {
  try {
    const body = await req.json();
    const { persona, topic, template, content } = body;

    await connectToDB();
    const created = await Generated.create({ persona, topic, template, content });

    return new Response(JSON.stringify(created), { status: 201 });
  } catch (err) {
    console.error("Save Error:", err);
    return new Response(JSON.stringify({ error: "Failed to save content" }), { status: 500 });
  }
}
