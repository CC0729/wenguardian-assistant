
import React, { createContext, useContext, useState, ReactNode } from "react";

type DifficultyLevel = "beginner" | "intermediate" | "advanced";

interface LearningContextType {
  difficulty: DifficultyLevel;
  setDifficulty: (level: DifficultyLevel) => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider = ({ children }: { children: ReactNode }) => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("beginner");

  return (
    <LearningContext.Provider value={{ difficulty, setDifficulty }}>
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error("useLearning must be used within a LearningProvider");
  }
  return context;
};
