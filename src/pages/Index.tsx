import React from "react";
import Navigation from "@/components/Navigation";
import SettingsDialog from "@/components/SettingsDialog";
import { useLearning } from "@/contexts/LearningContext";

const Index = () => {
  const { username } = useLearning();
  
  return (
    <div className="min-h-screen bg-paper-light">
      <SettingsDialog />
      <header className="py-16 bg-paper text-center border-b border-ink/10">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-ink mb-4 animate-fade-in">
            文言文学习助手
          </h1>
          <p className="text-lg text-ink/70 max-w-2xl mx-auto animate-slide-up">
            {username ? `欢迎回来，${username}` : "通过智能学习系统，轻松掌握文言文"}
          </p>
        </div>
      </header>

      <main className="py-12 animate-fade-in">
        <Navigation />
      </main>

      <footer className="py-8 text-center text-ink/60 border-t border-ink/10">
        <p>文言文学习助手 © 2024</p>
      </footer>
    </div>
  );
};

export default Index;
