
import React, { createContext, useContext, useState, ReactNode } from "react";

type GradeLevel = "elementary" | "junior" | "senior";
type ModelType = "Pro/deepseek-ai/DeepSeek-V3" | "Pro/Qwen/Qwen2-7B-Instruct";

interface LearningContextType {
<<<<<<< HEAD
  grade: GradeLevel;
  setGrade: (level: GradeLevel) => void;
  username: string;
  setUsername: (name: string) => void;
  model: ModelType;
  setModel: (model: ModelType) => void;
=======
  difficulty: DifficultyLevel;
  setDifficulty: (level: DifficultyLevel) => void;
>>>>>>> parent of e4487be (update)
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider = ({ children }: { children: ReactNode }) => {
<<<<<<< HEAD
  const [grade, setGrade] = useState<GradeLevel>("elementary");
  const [username, setUsername] = useState<string>("");
  const [model, setModel] = useState<ModelType>("Pro/Qwen/Qwen2-7B-Instruct");

  return (
    <LearningContext.Provider 
      value={{ 
        grade, 
        setGrade, 
        username, 
        setUsername,
        model,
        setModel
      }}
    >
=======
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("beginner");

  return (
    <LearningContext.Provider value={{ difficulty, setDifficulty }}>
>>>>>>> parent of e4487be (update)
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
