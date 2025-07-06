import { connectToDB } from "@/utils/db";
import Generated from "@/models/generated";
import { NextResponse } from "next/server";
export async function DELETE() {
  try {
    await connectToDB();
    await Generated.deleteMany({});
    return new Response(JSON.stringify({ message: "Cleared" }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Error clearing" }), { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDB();
    const results = await Generated.find().sort({ _id: -1 }).limit(10);
    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
