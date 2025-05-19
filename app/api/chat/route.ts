import { openai } from "@/lib/openai";
import { zfd } from "zod-form-data";

// Define the expected structure of the form data
const formDataSchema = zfd.formData({
  input: zfd.text(),
  history: zfd.text().optional(),
});

// Configuration constants
const MODEL_NAME = "gpt-4.1-nano-2025-04-14";

/**
 * Fetches relevant context from the vector store based on user input
 */
async function fetchContextFromVectorStore(query: string) {
  const vectorStoreId = "vs_682a39e7bea08191b085d014049ebf25";

  const search = await openai.vectorStores.search(vectorStoreId, {
    query,
    max_num_results: 50,
  });

  return search.data[0].content.map((content) => content.text);
}

/**
 * Creates a streaming response from OpenAI's chat completion
 */
async function createChatCompletion(
  context: string[],
  userInput: string,
  history: any[] = []
) {
  const messages = [
    {
      role: "system",
      content: `
        You are an AI assistant representing Mindaugas Gudeliūnas, a professional frontend developer.
        Your job is to answer questions as if you are Mindaugas himself.
        Speak in the first person using a confident, friendly, and clear tone. You are approachable and professional, and you explain technical decisions thoughtfully.

        When sharing contact details:
        - Don't add my email or phone number to your response. Never.
        - Always add a link to my social media profile. Never change the link text.
        - Only share the link to my social media without any additional text.

        When answering questions about your experience:
        - Never give code examples that represents my solutions, but rather explain how to implement it.
        - Always structure your response as a resume.
        - If the answer depends on portfolio content, draw from the provided context or documents.

        When answering questions:
        - Don't add certain words to your response, like "Certainly", "Absolutely", "Of course", etc.
        - Reference specific projects or code snippets from Mindaugas' portfolio when available.
        - If the answer depends on portfolio content, draw from the provided context or documents.
        - If you don't have enough information, say so clearly instead of guessing.
      `,
    },
    {
      role: "user",
      content: context.join("\n\n"),
    },
    ...history.slice(),
    {
      role: "user",
      content: userInput,
    },
  ];

  return await openai.chat.completions.create({
    model: MODEL_NAME,
    stream: true,
    temperature: 0,
    max_tokens: 1000,
    messages,
  });
}

/**
 * Creates a readable stream from the OpenAI response
 */
function createResponseStream(response: any) {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const token = chunk.choices[0]?.delta?.content || "";
        controller.enqueue(encoder.encode(token));
      }
      controller.close();
    },
  });
}

/**
 * Main API route handler for chat requests
 */
export async function POST(request: Request) {
  // Validate request data
  const { data, success } = formDataSchema.safeParse(await request.formData());

  if (!success) {
    return new Response("Invalid request", { status: 400 });
  }

  // Start performance tracking
  const requestId = request.headers.get("x-vercel-id") || "local";
  console.time(`text completion ${requestId}`);

  try {
    // Get context from vector store
    const context = await fetchContextFromVectorStore(data.input);
    // Parse the history from string to array
    const history = data.history ? JSON.parse(data.history) : [];

    // Create chat completion
    const response = await createChatCompletion(context, data.input, history);

    // Create and return streaming response
    const stream = createResponseStream(response);

    console.timeEnd(`text completion ${requestId}`);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error processing chat request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
