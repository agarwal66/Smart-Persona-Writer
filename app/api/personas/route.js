import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Persona from "@/models/Persona";
import mongoose from "mongoose";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  await mongoose.connect(process.env.MONGODB_URI);
  const newPersona = await Persona.create({
    userId: session.user.email,
    ...body,
  });

  return Response.json(newPersona);
}
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    await connectToDB();
    await Persona.findByIdAndDelete(id);
    return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to delete" }), { status: 500 });
  }
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  await mongoose.connect(process.env.MONGODB_URI);
  const personas = await Persona.find({ userId: session.user.email }).sort({ createdAt: -1 });

  return Response.json(personas);
}
