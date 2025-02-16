import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface StreamingLoaderProps {
  currentStep: number;
  totalSteps: number;
}

const StreamingLoader = ({ currentStep, totalSteps }: StreamingLoaderProps) => {
  return (
    <div className="flex flex-col items-center space-y-4 p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="text-sm font-medium">{currentStep}/{totalSteps}</span>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
        transition={{ duration: 0.5 }}
        className="w-full h-2 bg-primary/20 rounded-full overflow-hidden"
      >
        <div className="h-full bg-primary rounded-full" />
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-ink/70 text-center"
      >
        正在生成第 {currentStep} 道题目...
      </motion.p>
    </div>
  );
};

export default StreamingLoader; 