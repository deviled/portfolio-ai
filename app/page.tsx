"use client";

import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { track } from "@vercel/analytics";
import Image from "next/image";
import { RiLoader3Line, RiRefreshLine } from "react-icons/ri";

type Message = {
  role: "user" | "assistant";
  content: string;
  latency?: number;
};

type Question = {
  question: string;
  description: string;
};

export default function Home() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const MAX_MESSAGES = 1;

  const questions: Question[] = [
    {
      question: "What is your professional experience?",
      description: "Learn about my professional journey",
    },
    {
      question: "What are your clean code principles?",
      description: "Learn about my coding standards",
    },
    {
      question: "What tech stack do you use?",
      description: "Explore my development tools",
    },
    {
      question: "Contact me",
      description: "Let's discuss your project or opportunity",
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const keyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") return inputRef.current?.focus();
      if (e.key === "Escape") return setInput("");
    };
    window.addEventListener("keydown", keyDown);
    return () => window.removeEventListener("keydown", keyDown);
  }, []);

  async function handleSubmit(inputText: string) {
    if (!inputText.trim()) return;
    if (messages.length >= MAX_MESSAGES * 2) return; // Each message has a user and assistant response

    setHasStartedChat(true);
    setIsPending(true);
    track("Text input");

    const formData = new FormData();
    formData.append("input", inputText);
    formData.append("history", JSON.stringify(messages));

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: inputText },
      { role: "assistant", content: "" }, // Placeholder to stream into
    ];
    setMessages(updatedMessages);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok || !response.body) {
        throw new Error(
          "There was an error with your request. Please try again later."
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          assistantMessage += chunk;

          setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            // Simply update the last message since we know it's the assistant's message
            newMessages[newMessages.length - 1] = {
              role: "assistant",
              content: assistantMessage,
            };
            return newMessages;
          });
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsPending(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSubmit(input);
  }

  function handleRefresh() {
    setMessages([]);
    setHasStartedChat(false);
  }

  return (
    <div
      className={`${
        hasStartedChat ? "pt-4 h-[calc(100vh-100px)]" : "items-center"
      } w-full flex justify-center`}
    >
      <div className="flex flex-col w-full max-w-4xl">
        <div
          className={`flex-1 ${
            hasStartedChat
              ? "overflow-y-auto p-4 space-y-4 flex flex-col items-start"
              : "flex items-center justify-center p-4"
          } [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']`}
        >
          {!hasStartedChat && (
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {questions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubmit(item.question)}
                    disabled={isPending || messages.length >= MAX_MESSAGES * 2}
                    className="p-6 rounded-lg bg-neutral-200/80 dark:bg-neutral-800/80 hover:bg-neutral-300/80 dark:hover:bg-neutral-700/80 text-left transition-all duration-200 h-full flex flex-col group"
                  >
                    <h3 className="text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white font-medium transition-colors duration-200">
                      {item.question}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
                      {item.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex w-full ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "user" ? (
                <div className="bg-neutral-200/80 dark:bg-neutral-800/80 text-white px-4 py-2 rounded-2xl rounded-tr-none">
                  {message.content}
                </div>
              ) : (
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <Markdown>{message.content}</Markdown>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div
          className={`${
            hasStartedChat ? "fixed bottom-1 left-0 right-0" : ""
          } p-4 bg-white dark:bg-black`}
        >
          <div className="max-w-4xl mx-auto">
            <form
              className="rounded-full bg-neutral-200/80 dark:bg-neutral-800/80 flex items-center w-full"
              onSubmit={handleFormSubmit}
            >
              <div className="flex items-center gap-3 pl-4">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                  <Image
                    src="/5.jpg"
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="object-cover rounded-full"
                    priority
                  />
                </div>
              </div>
              <input
                type="text"
                className="bg-transparent focus:outline-hidden p-4 w-full placeholder:text-neutral-600 dark:placeholder:text-neutral-400"
                placeholder={
                  messages.length >= MAX_MESSAGES * 2
                    ? "Click refresh to continue"
                    : "Ask me anything"
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                ref={inputRef}
                disabled={isPending || messages.length >= MAX_MESSAGES * 2}
              />

              <button
                type={messages.length >= MAX_MESSAGES * 2 ? "button" : "submit"}
                className="p-4 text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                disabled={isPending}
                onClick={
                  messages.length >= MAX_MESSAGES * 2
                    ? handleRefresh
                    : undefined
                }
                aria-label={
                  messages.length >= MAX_MESSAGES * 2
                    ? "Refresh chat"
                    : "Submit"
                }
              >
                {isPending ? (
                  <RiLoader3Line className="animate-spin" size={24} />
                ) : messages.length >= MAX_MESSAGES * 2 ? (
                  <RiRefreshLine size={24} />
                ) : null}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
