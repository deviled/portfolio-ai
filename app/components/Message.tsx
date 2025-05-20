import { FC } from "react";
import Markdown from "react-markdown";

export type MessageType = {
  role: "user" | "assistant";
  content: string;
  threadId?: string;
};

interface MessageProps {
  message: MessageType;
}

export const Message: FC<MessageProps> = ({ message }) => {
  return (
    <div
      className={`flex w-full ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {message.role === "user" ? (
        <div className="bg-neutral-300/70 dark:bg-neutral-700/80 text-white px-4 py-2 rounded-2xl rounded-tr-none">
          {message.content}
        </div>
      ) : (
        <div className="prose prose-neutral dark:prose-invert max-w-none prose-li:marker:text-black dark:prose-li:marker:text-white">
          <Markdown>{message.content}</Markdown>
          {!message.content && (
            <span className="inline-block w-1 h-4 ml-1 bg-neutral-700 dark:bg-neutral-100 animate-pulse" />
          )}
        </div>
      )}
    </div>
  );
};
