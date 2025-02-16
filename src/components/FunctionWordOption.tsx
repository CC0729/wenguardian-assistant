import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface FunctionWordOptionProps {
  word: string;
  id: string;
  isUsed?: boolean;
  isDragging?: boolean;
}

const FunctionWordOption = ({ word, id, isUsed, isDragging }: FunctionWordOptionProps) => {
  const { attributes, listeners, setNodeRef, isDragging: isCurrentDragging } = useDraggable({
    id: id,
    data: {
      word,
    },
  });

  const styles = cn(
    "px-4 py-2 bg-paper border border-ink/10 rounded-md shadow-sm",
    "hover:bg-paper-dark transition-colors duration-200",
    "cursor-move select-none whitespace-nowrap",
    "transform transition-transform",
    (isDragging || isCurrentDragging) && "opacity-50 scale-105 shadow-lg",
    isUsed && "opacity-50 cursor-not-allowed pointer-events-none",
  );

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={styles}
      disabled={isUsed}
    >
      {word}
    </button>
  );
};

// 拖拽时显示的预览组件
export const DraggingWordPreview = ({ word }: { word: string }) => {
  return (
    <div className="px-4 py-2 bg-paper border-2 border-green-500/50 rounded-md shadow-lg transform scale-105 whitespace-nowrap">
      {word}
    </div>
  );
};

export default FunctionWordOption; 