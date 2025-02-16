import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DroppableBlankProps {
  id: string;
  value?: string;
}

const DroppableBlank = ({ id, value }: DroppableBlankProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <span
      ref={setNodeRef}
      className={cn(
        "inline-flex items-center justify-center",
        "min-w-20 h-8 mx-1",
        "relative transition-all duration-200",
        !value && [
          "border-b-2 border-dashed border-ink/30",
          "before:absolute before:inset-0 before:-z-10",
          "before:bg-gradient-to-r before:from-green-100/0 before:to-green-100/0",
          "before:transition-colors before:duration-200",
        ],
        isOver && !value && [
          "border-green-500 border-solid",
          "before:from-green-100 before:to-green-50",
        ],
        isOver && value && "ring-2 ring-green-500 ring-opacity-50 rounded",
      )}
    >
      {value ? (
        <motion.span
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "px-3 py-1 bg-paper-dark rounded text-ink whitespace-nowrap",
            "transition-all duration-200",
            "flex items-center justify-center",
            isOver && "bg-green-50"
          )}
        >
          {value}
        </motion.span>
      ) : (
        <motion.span
          animate={isOver ? { scale: 1.1 } : { scale: 1 }}
          className="absolute inset-0 rounded"
        />
      )}
    </span>
  );
};

export default DroppableBlank; 