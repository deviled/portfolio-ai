import { FC } from "react";

export type Question = {
  question: string;
  description: string;
};

interface QuestionProps {
  question: Question;
  onQuestionClick: (question: string) => void;
  isDisabled?: boolean;
}

export const Question: FC<QuestionProps> = ({
  question,
  onQuestionClick,
  isDisabled,
}) => {
  return (
    <button
      onClick={() => onQuestionClick(question.question)}
      disabled={isDisabled}
      className="p-6 rounded-lg bg-neutral-200/80 dark:bg-neutral-800/80 hover:bg-neutral-300/80 dark:hover:bg-neutral-700/80 text-left transition-all duration-200 h-full flex flex-col group"
    >
      <h3 className="text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white font-medium transition-colors duration-200">
        {question.question}
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
        {question.description}
      </p>
    </button>
  );
};
