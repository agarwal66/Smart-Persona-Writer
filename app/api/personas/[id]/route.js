import { connectToDB } from "@/utils/db";
import Persona from "@/models/Persona";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    await connectToDB();
    await Persona.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
