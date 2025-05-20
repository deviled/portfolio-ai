import { FC, useRef, useState } from "react";
import Image from "next/image";
import { RiLoader3Line, RiArrowRightLine } from "react-icons/ri";

interface ChatInputProps {
  isPending: boolean;
  isRefresh: boolean;
  onInputChange: (value: string, shouldSubmit?: boolean) => void;
  onRefresh: () => void;
}

export const ChatInput: FC<ChatInputProps> = ({
  isPending,
  isRefresh,
  onInputChange,
  onRefresh,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInputChange(input, true);
    setInput("");
  };

  return (
    <div className="p-4 bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto">
        <form
          className="rounded-full bg-neutral-200/80 dark:bg-neutral-800/80 flex items-center w-full"
          onSubmit={handleSubmit}
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
              isRefresh ? "You've reached the message limit" : "Ask me anything"
            }
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              onInputChange(e.target.value);
            }}
            ref={inputRef}
            disabled={isPending || isRefresh}
          />

          <button
            type={isRefresh ? "button" : "submit"}
            className="p-4 text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
            disabled={isPending}
            onClick={isRefresh ? onRefresh : undefined}
            aria-label={isRefresh ? "Refresh chat" : "Submit"}
          >
            {isPending ? (
              <RiLoader3Line className="animate-spin" size={24} />
            ) : isRefresh ? null : (
              <RiArrowRightLine size={24} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
