import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function GET(req: NextRequest) {
  // Prevent execution in production environment
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ status: 404 });
  }

  try {
    // Get all files
    const files = await openai.files.list();

    // Get all vector stores
    const vectorStores = await openai.vectorStores.list();

    return NextResponse.json({
      files: files.data,
      vectorStores: vectorStores.data,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
