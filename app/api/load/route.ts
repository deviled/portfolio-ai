import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import fs from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  // Prevent execution in production environment
  if (process.env.NODE_ENV === "production") {
    throw { status: 403 };
  }

  try {
    // Get the 'pdfPath' query parameter from the URL
    const { searchParams } = new URL(req.url);
    const pdfPath = path.resolve(process.cwd(), searchParams.get("pdfPath")!);

    // Read the specified local PDF
    const buffer = await fs.readFile(pdfPath);

    // Upload file to OpenAI
    const file = new File([buffer], "upload.pdf", { type: "application/pdf" });
    const upload = await openai.files.create({
      file,
      purpose: "assistants",
    });

    // Create a vector store using that file
    const vectorStore = await openai.vectorStores.create({
      name: "resume",
      file_ids: [upload.id],
    });

    return NextResponse.json({
      message: "PDF uploaded and vector store created",
      vectorStoreId: vectorStore.id,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
