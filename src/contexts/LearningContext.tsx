import React, { createContext, useContext, useState, ReactNode } from "react";

type GradeLevel = "primary" | "junior" | "senior";

interface LearningContextType {
  grade: GradeLevel;
  setGrade: (level: GradeLevel) => void;
  username: string;
  setUsername: (name: string) => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider = ({ children }: { children: ReactNode }) => {
  const [grade, setGrade] = useState<GradeLevel>("primary");
  const [username, setUsername] = useState<string>("");

  return (
    <LearningContext.Provider 
      value={{ 
        grade, 
        setGrade, 
        username, 
        setUsername 
      }}
    >
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
