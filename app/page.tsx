"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { track } from "@vercel/analytics";
import { MAX_MESSAGES } from "@/constants/chat";
import { DEFAULT_QUESTIONS } from "@/constants/questions";
import { Question } from "@/components/Question";
import { ChatInput } from "./components/ChatInput";
import { Message, type MessageType } from "@/components/Message";

interface StreamData {
  type: string;
  content: string;
  threadId?: string;
}

const handleStreamResponse = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>
) => {
  const decoder = new TextDecoder();
  let buffer = "";
  let currentContent = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6)) as StreamData;
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

export default function Home() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isPending, setIsPending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (inputText: string) => {
    if (!inputText.trim() || messages.length >= MAX_MESSAGES * 2) return;

    setIsPending(true);
    track("Text input");

    const formData = new FormData();
    formData.append("input", inputText);
    formData.append("history", JSON.stringify(messages));

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

      await handleStreamResponse(response.body.getReader(), setMessages);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  const handleInputChange = (value: string, shouldSubmit?: boolean) => {
    if (shouldSubmit) {
      handleSubmit(value);
    }
  };

  const handleRefresh = () => {
    setMessages([]);
  };

  const handleNewChat = () => {
    if (isPending) return;
    setMessages([]);
    track("New chat");
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#1e1e1e] overflow-hidden">
      {/* Main Content */}
      <main className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-12 sm:pb-24">
          {messages.length === 0 ? (
            <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
              <div className="space-y-6 sm:space-y-8 w-full">
                <div className="text-center space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-bold text-[#d4d4d4]">
                    Chat with Digital <span className="text-[#FF00FF]">Me</span>
                    .
                  </h1>
                  <p className="text-[#a0a0a0] text-sm sm:text-lg">
                    Ask me anything about my journey, projects, or tech stack
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {DEFAULT_QUESTIONS.map((question, index) => (
                    <Question
                      key={index}
                      question={question}
                      onQuestionClick={handleSubmit}
                      isDisabled={isPending}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {messages.map((message, index) => (
                <Message
                  key={index}
                  message={message}
                  isLast={index === messages.length - 1}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>
      </main>

      {/* Footer with Chat Input */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#1e1e1e]">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <ChatInput
            isPending={isPending}
            isRefresh={messages.length >= MAX_MESSAGES * 2}
            onInputChange={handleInputChange}
            onRefresh={handleRefresh}
            onNewChat={handleNewChat}
            showNewChat={messages.length > 0}
          />
        </div>
      </footer>
    </div>
  );
}
