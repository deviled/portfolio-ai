import { FC, useRef, useState } from "react";
import Image from "next/image";
import { RiArrowRightLine, RiAddLine } from "react-icons/ri";

interface ChatInputProps {
  isPending: boolean;
  isRefresh: boolean;
  onInputChange: (value: string, shouldSubmit?: boolean) => void;
  onRefresh: () => void;
  onNewChat: () => void;
  showNewChat?: boolean;
}

export const ChatInput: FC<ChatInputProps> = ({
  isPending,
  isRefresh,
  onInputChange,
  onRefresh,
  onNewChat,
  showNewChat = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInputChange(input, true);
    setInput("");
  };

  return (
    <div className="relative">
      <div className="bg-[#2d2d2d] text-[#d4d4d4] placeholder:text-[#6b6b6b] border border-[#3d3d3d] flex flex-col rounded-lg">
        <div className="flex items-center gap-3 py-3 px-4">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-[#3d3d3d]">
            <Image
              src="/5.jpg"
              alt="Avatar"
              width={32}
              height={32}
              className="object-cover"
              priority
            />
          </div>
          <form
            className="flex-1 flex items-center gap-2"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              className="flex-1 bg-transparent focus:outline-none p-2 text-[#d4d4d4] placeholder:text-[#6b6b6b]"
              placeholder={
                isRefresh
                  ? "You've reached the message limit"
                  : "Ask me anything"
              }
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                onInputChange(e.target.value);
              }}
              ref={inputRef}
              disabled={isPending || isRefresh}
            />
            <div className="flex items-center gap-2">
              {showNewChat && (
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center text-[#d4d4d4] hover:text-white hover:bg-[#3d3d3d] active:scale-95 active:bg-[#4d4d4d] rounded-full border border-[#3d3d3d] transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:active:scale-100"
                  onClick={onNewChat}
                  disabled={isPending}
                  aria-label="New chat"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <RiAddLine className="text-[#d4d4d4]" size={18} />
                  </div>
                </button>
              )}
              <button
                type={isRefresh ? "button" : "submit"}
                className="w-8 h-8 flex items-center justify-center text-[#d4d4d4] hover:text-white hover:bg-[#3d3d3d] active:scale-95 active:bg-[#4d4d4d] rounded-full border border-[#3d3d3d] transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:active:scale-100"
                disabled={isPending}
                onClick={isRefresh ? onRefresh : undefined}
                aria-label={isRefresh ? "Refresh chat" : "Submit"}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  {isRefresh ? null : <RiArrowRightLine size={18} />}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
