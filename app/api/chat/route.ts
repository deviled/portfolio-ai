import { openai } from "@/lib/openai";
import { zfd } from "zod-form-data";

// Types
interface ChatHistory {
  messages: Array<{ role: string; content: string }>;
  threadId?: string;
}

// Configuration
const ASSISTANT_ID = "asst_nkSsmPyzFNtHX1ATkKrPCTcP";

// Schema validation
const formDataSchema = zfd.formData({
  input: zfd.text(),
  history: zfd.text().optional(),
});

/**
 * Creates or retrieves a thread for the conversation
 */
async function getOrCreateThread(threadId?: string) {
  try {
    if (threadId) {
      return await openai.beta.threads.retrieve(threadId);
    }
    return await openai.beta.threads.create();
  } catch (error) {
    throw new Error("Failed to manage conversation thread");
  }
}

/**
 * Creates a message in the thread
 */
async function createThreadMessage(threadId: string, content: string) {
  try {
    return await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content,
    });
  } catch (error) {
    throw new Error("Failed to create message");
  }
}

/**
 * Creates a run with the assistant
 */
async function createThreadRun(threadId: string) {
  try {
    return await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID,
      stream: true,
    });
  } catch (error) {
    throw new Error("Failed to create run");
  }
}

/**
 * Main API route handler for chat requests
 */
export async function POST(request: Request) {
  const requestId = request.headers.get("x-vercel-id") || "local";
  console.time(`text completion ${requestId}`);

  try {
    // Validate request data
    const { data, success } = formDataSchema.safeParse(
      await request.formData()
    );
    if (!success) {
      return new Response("Invalid request data", { status: 400 });
    }

    // Parse the history
    const history: ChatHistory = data.history
      ? JSON.parse(data.history)
      : { messages: [], threadId: undefined };

    // Get or create thread
    const thread = await getOrCreateThread(history.threadId);

    // Add the user's message to the thread
    await createThreadMessage(thread.id, data.input);

    // Create a run with the assistant
    const run = await createThreadRun(thread.id);

    // Convert OpenAI stream to ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of run) {
            if (chunk.event === "thread.message.delta") {
              const delta = chunk.data.delta;
              if (delta.content?.[0]?.type === "text") {
                const content = delta.content[0].text?.value || "";
                if (content) {
                  // Remove citations from the content
                  const cleanedContent = content.replace(
                    /(?:\[citation:\d+\]|【\d+:\d+†[^】]+】)/g,
                    ""
                  );
                  // Send only the new content instead of accumulated content
                  const response = {
                    type: "message",
                    content: cleanedContent,
                    threadId: thread.id,
                  };
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify(response)}\n\n`
                    )
                  );
                }
              }
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    console.timeEnd(`text completion ${requestId}`);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}
