import React, { createContext, useContext, useState, ReactNode } from "react";
import { ApiConfig, defaultConfig } from "@/services/api";

export type GradeLevel = "elementary" | "junior" | "senior";

interface LearningContextType {
  grade: GradeLevel;
  setGrade: (level: GradeLevel) => void;
  username: string;
  setUsername: (name: string) => void;
  apiConfig: ApiConfig;
  setApiConfig: (config: ApiConfig) => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider = ({ children }: { children: ReactNode }) => {
  const [grade, setGrade] = useState<GradeLevel>("elementary");
  const [username, setUsername] = useState<string>("");
  const [apiConfig, setApiConfig] = useState<ApiConfig>(defaultConfig);

  return (
    <LearningContext.Provider 
      value={{ 
        grade, 
        setGrade, 
        username, 
        setUsername,
        apiConfig,
        setApiConfig
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
