"use client";

import { FC, useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { track } from "@vercel/analytics";
import { DEFAULT_QUESTIONS, MAX_MESSAGES } from "@/constants/chat";
import { Question } from "@/components/Question";
import { Message, type MessageType } from "@/components/Message";
import { ChatInput } from "@/components/ChatInput";

const Home: FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStreamResponse = async (
    reader: ReadableStreamDefaultReader<Uint8Array>
  ) => {
    const decoder = new TextDecoder();
    let buffer = "";
    let currentContent = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "message" && data.content) {
              currentContent += data.content;
              setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === "assistant") {
                  lastMessage.content = currentContent;
                  lastMessage.threadId = data.threadId;
                }
                return newMessages;
              });
            }
          } catch (e) {
            console.error("Error parsing stream data:", e);
          }
        }
      }
    }
  };

  const handleSubmit = async (inputText: string) => {
    if (!inputText.trim() || messages.length >= MAX_MESSAGES * 2) return;

    setHasStartedChat(true);
    setIsPending(true);
    track("Text input");

    const formData = new FormData();
    formData.append("input", inputText);
    formData.append("history", JSON.stringify(messages));

    // Add user message and empty assistant message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: inputText },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response from server");
      }

      await handleStreamResponse(response.body.getReader());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  const handleInputChange = (inputText: string, shouldSubmit?: boolean) => {
    if (shouldSubmit) {
      handleSubmit(inputText);
    }
  };

  const handleRefresh = () => {
    setMessages([]);
    setHasStartedChat(false);
  };

  return (
    <div
      className={`${
        hasStartedChat ? "pt-4 h-[calc(100vh-100px)]" : "items-center"
      } w-full flex justify-center`}
    >
      <div className="flex flex-col w-full max-w-4xl">
        {!hasStartedChat ? (
          <div className="w-full p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {DEFAULT_QUESTIONS.map((question, index) => (
                <Question
                  key={index}
                  question={question}
                  onQuestionClick={handleSubmit}
                  isDisabled={isPending || messages.length >= MAX_MESSAGES * 2}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 relative overflow-y-auto p-4 space-y-4 flex flex-col items-start [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div
          className={`${
            hasStartedChat
              ? "fixed bottom-1 left-0 right-0 flex justify-center"
              : ""
          }`}
        >
          <div className="w-full max-w-4xl">
            <ChatInput
              isPending={isPending}
              isRefresh={messages.length >= MAX_MESSAGES * 2}
              onInputChange={handleInputChange}
              onRefresh={handleRefresh}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
