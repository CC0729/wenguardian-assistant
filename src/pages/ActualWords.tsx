import React, { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLearning } from "@/contexts/LearningContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { callLLM, type Question } from "@/services/api";
import type { GradeLevel } from "@/contexts/LearningContext";
import { Skeleton } from "@/components/ui/skeleton";

const ActualWords = () => {
  const { grade, apiConfig } = useLearning();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [loadingExplanation, setLoadingExplanation] = useState<Record<number, boolean>>({});

  const generatePrompt = (grade: GradeLevel) => {
    return `请根据${grade === "elementary" ? "小学" : grade === "junior" ? "初中" : "高中"}学段的要求，生成5道文言文实词理解题。
每道题目需要包含以下内容：
1. 一个实词
2. 包含该实词的完整语境（句子或段落）
3. 四个选项（A、B、C、D），其中只有一个是正确答案
4. 答案解析

请按照以下 JSON 格式返回：
{
  "questions": [
    {
      "id": 1,
      "word": "实词",
      "context": "语境",
      "options": [
        { "id": "A", "text": "选项内容", "correct": false },
        { "id": "B", "text": "选项内容", "correct": true },
        { "id": "C", "text": "选项内容", "correct": false },
        { "id": "D", "text": "选项内容", "correct": false }
      ],
      "explanation": "答案解析"
    }
  ]
}`;
  };

  const { data: questions, isLoading, error } = useQuery<Question[]>({
    queryKey: ['actualWords', grade, apiConfig.model],
    queryFn: async () => {
      const response = await callLLM([
        { role: 'user', content: generatePrompt(grade) }
      ], apiConfig);
      
      try {
        // 清理响应中的 markdown 标记
        const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        const parsed = JSON.parse(cleanResponse);
        return parsed.questions;
      } catch (e) {
        console.error('解析响应失败:', e);
        toast({
          description: "生成题目失败，请重试",
          variant: "destructive",
        });
        throw new Error('生成题目失败，请重试');
      }
    },
  });

  const generateExplanationPrompt = (question: Question, userAnswer: string) => {
    return `请对以下文言文实词理解题的答案进行详细解析：

题目：在"${question.context}"中，"${question.word}"的含义是什么？

选项：
A. ${question.options.find(opt => opt.id === 'A')?.text}
B. ${question.options.find(opt => opt.id === 'B')?.text}
C. ${question.options.find(opt => opt.id === 'C')?.text}
D. ${question.options.find(opt => opt.id === 'D')?.text}

正确答案：${question.options.find(opt => opt.correct)?.text}
学生答案：${userAnswer}

请从以下几个方面进行解析：
1. 该实词在文中的具体含义
2. 为什么其他选项不正确
3. 这个实词在古代常见的其他用法
4. 现代汉语中相近的用法举例`;
  };

  const handleAnswer = async (questionId: number, optionId: string, isCorrect: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setLoadingExplanation((prev) => ({ ...prev, [questionId]: true }));

    if (questions) {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        try {
          const selectedOption = question.options.find(opt => opt.id === optionId);
          const response = await callLLM([
            { 
              role: 'user', 
              content: generateExplanationPrompt(question, selectedOption?.text || '') 
            }
          ], apiConfig);
          
          setExplanations(prev => ({ ...prev, [questionId]: response }));
        } catch (error) {
          console.error('获取解析失败:', error);
          toast({
            description: "获取解析失败，请重试",
            variant: "destructive",
          });
        } finally {
          setLoadingExplanation(prev => ({ ...prev, [questionId]: false }));
        }
      }
    }

    if (isCorrect) {
      toast({
        description: "回答正确！",
        className: "bg-green-500 text-white",
      });
    } else {
      toast({
        description: "答案不正确，请继续努力！",
        className: "bg-red-500 text-white",
      });
    }
  };

  const getOptionStyle = (questionId: number, optionId: string, correct: boolean) => {
    if (!answers[questionId]) return "";
    
    if (answers[questionId] === optionId) {
      return correct ? "bg-green-500 text-white hover:bg-green-600" : "bg-red-500 text-white hover:bg-red-600";
    }
    
    if (correct && answers[questionId]) {
      return "bg-green-500 text-white hover:bg-green-600";
    }
    
    return "";
  };

  // 添加加载状态提示数组
  const loadingSteps = [
    "正在连接到AI模型...",
    "正在生成适合学段的题目...",
    "正在优化题目难度...",
    "正在编写解析说明...",
    "马上就好..."
  ];

  const [currentStep, setCurrentStep] = useState(0);

  // 在useQuery之后添加
  React.useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % loadingSteps.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper-light">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-ink hover:text-ink/70">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-ink mb-6">实词训练</h1>
          <p className="text-ink/70 mb-8">
            当前学段：{grade === "elementary" ? "小学" : grade === "junior" ? "初中" : "高中"}
          </p>

          <div className="space-y-8">
            {[1, 2, 3, 4, 5].map((index) => (
              <Card key={index} className="p-6 bg-paper relative overflow-hidden">
                <div className="mb-4">
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((optionIndex) => (
                    <Skeleton key={optionIndex} className="h-12" />
                  ))}
                </div>
                
                {/* 添加加载动画覆盖层 */}
                <AnimatePresence>
                  <motion.div 
                    className="absolute inset-0 bg-paper/80 backdrop-blur-sm flex flex-col items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div 
                      className="flex items-center gap-2 text-ink/70"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <motion.span
                        key={currentStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="text-sm font-medium"
                      >
                        {loadingSteps[currentStep]}
                      </motion.span>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper-light flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-ink mb-4">出错了</h2>
          <p className="text-ink/70 mb-6">{(error as Error).message}</p>
          <Button onClick={() => window.location.reload()}>
            重新加载
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper-light">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-ink hover:text-ink/70">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-ink mb-6">实词训练</h1>
        <p className="text-ink/70 mb-8">
          当前学段：{grade === "elementary" ? "小学" : grade === "junior" ? "初中" : "高中"}
        </p>

        <div className="space-y-8">
          {questions?.map((question) => (
            <Card key={question.id} className="p-6 bg-paper">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">
                  第{question.id}题：请选择"{question.word}"在文中的含义
                </h3>
                <p className="text-ink/80 bg-paper-dark p-4 rounded">
                  {question.context}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {question.options.map((option) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    className={`justify-start h-auto py-3 ${getOptionStyle(question.id, option.id, option.correct)} ${
                      answers[question.id] ? "pointer-events-none" : ""
                    }`}
                    onClick={() => handleAnswer(question.id, option.id, option.correct)}
                  >
                    {option.id}. {option.text}
                  </Button>
                ))}
              </div>
              {answers[question.id] && (
                <div className="mt-4 p-3 bg-paper-dark rounded">
                  <p className="text-ink/80">
                    {question.options.find(opt => opt.correct)?.text} 是正确答案。
                  </p>
                </div>
              )}
              
              {/* 添加解析部分 */}
              {answers[question.id] && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-2">答案解析</h4>
                  {loadingExplanation[question.id] ? (
                    <div className="flex items-center gap-2 text-ink/70">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>正在生成解析...</span>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-paper-dark p-4 rounded"
                    >
                      <p className="text-ink/80 whitespace-pre-line">
                        {explanations[question.id]}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActualWords;
