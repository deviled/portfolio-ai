import { FC, useState, useEffect } from "react";
import Markdown from "react-markdown";

export type MessageType = {
  role: "user" | "assistant";
  content: string;
  threadId?: string;
};

interface MessageProps {
  message: MessageType;
  isLast?: boolean;
}

const LOADING_MESSAGES = [
  "Diving into the depths of the portfolio...",
  "Exploring the codebase like a digital archaeologist...",
  "Unraveling the mysteries of the tech stack...",
  "Consulting the digital archives...",
  "Decoding the development journey...",
  "Mining the repository for insights...",
  "Navigating through the code labyrinth...",
  "Sifting through the digital sands of time...",
  "Connecting the dots in the project timeline...",
];

const getRandomMessage = (currentMessage: string) => {
  const availableMessages = LOADING_MESSAGES.filter(
    (msg) => msg !== currentMessage
  );
  return availableMessages[
    Math.floor(Math.random() * availableMessages.length)
  ];
};

export const Message: FC<MessageProps> = ({ message, isLast }) => {
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    if (!message.content) {
      const interval = setInterval(() => {
        setLoadingMessage((prev) => getRandomMessage(prev));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [message.content]);

  return (
    <div
      className={`flex w-full ${
        message.role === "user" ? "justify-end" : "justify-start"
      } ${!isLast ? "mb-4 sm:mb-6" : ""}`}
    >
      {message.role === "user" ? (
        <div className="bg-neutral-200 dark:bg-[#1e1e1e] text-neutral-900 dark:text-white rounded-2xl rounded-tr-none border border-neutral-300 dark:border-[#3d3d3d] px-3 py-2 sm:px-4 max-w-[85%] sm:max-w-[80%] text-base">
          {message.content}
        </div>
      ) : (
        <div className="relative w-full">
          <div className="text-neutral-900 dark:text-white px-3 py-2 sm:px-4">
            <div className="prose prose-neutral dark:prose-invert max-w-none prose-li:marker:text-neutral-900 dark:prose-li:marker:text-white prose-base prose-p:text-neutral-900 dark:prose-p:text-white prose-headings:text-neutral-900 dark:prose-headings:text-white prose-strong:text-neutral-800 dark:prose-strong:text-[#f5f5f5] prose-strong:font-extrabold prose-em:text-neutral-900 dark:prose-em:text-white prose-code:text-neutral-900 dark:prose-code:text-white prose-pre:text-neutral-900 dark:prose-pre:text-white prose-blockquote:text-neutral-900 dark:prose-blockquote:text-white">
              <Markdown>{message.content}</Markdown>
              {!message.content && (
                <div className="text-neutral-900 dark:text-white italic text-base">
                  {loadingMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
