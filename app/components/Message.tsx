import { FC, useState, useEffect } from "react";
import Markdown from "react-markdown";

export type MessageType = {
  role: "user" | "assistant";
  content: string;
  threadId?: string;
};

interface MessageProps {
  message: MessageType;
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

export const Message: FC<MessageProps> = ({ message }) => {
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
      }`}
    >
      {message.role === "user" ? (
        <div className="bg-[#1e1e1e] text-[#d4d4d4] rounded-2xl rounded-tr-none border border-[#3d3d3d] px-3 py-2 sm:px-4 max-w-[85%] sm:max-w-[80%] text-sm sm:text-base">
          {message.content}
        </div>
      ) : (
        <div className="w-full">
          <div className="bg-[#252526] text-[#d4d4d4] rounded-2xl rounded-tl-none border border-[#3d3d3d] px-3 py-2 sm:px-4">
            <div className="prose prose-neutral dark:prose-invert max-w-none prose-li:marker:text-[#d4d4d4] prose-sm sm:prose-base">
              <Markdown>{message.content}</Markdown>
              {!message.content && (
                <div className="text-[#d4d4d4] italic text-sm sm:text-base">
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
