import React, { useState } from "react";
import { ArrowLeft, Loader2, PartyPopper } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const ActualWords = () => {
  const { grade, apiConfig } = useLearning();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [username] = useState("同学");

  const generatePrompt = (grade: GradeLevel) => {
    return `请根据${grade === "elementary" ? "小学" : grade === "junior" ? "初中" : "高中"}学段的要求，生成5道文言文实词理解题。
每道题目需要包含以下内容：
1. 一个实词
2. 包含该实词的完整语境（句子或段落）
3. 四个选项（A、B、C、D），其中只有一个是正确答案
4. 详细的答案解析，包含：
   - 该实词在文中的具体含义
   - 为什么其他选项不正确
   - 这个实词在古代常见的其他用法
   - 现代汉语中相近的用法举例

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
      "explanation": "答案解析（包含上述四个方面）"
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

  const calculateAndShowSummary = () => {
    if (!questions) return;
    
    const totalQuestions = questions.length;
    const correctAnswers = questions.reduce((count, question) => {
      const userAnswer = answers[question.id];
      const correctOption = question.options.find(opt => opt.correct);
      return userAnswer === correctOption?.id ? count + 1 : count;
    }, 0);
    
    setAccuracy((correctAnswers / totalQuestions) * 100);
    setShowSummary(true);
  };

  const handleAnswer = (questionId: number, optionId: string, isCorrect: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));

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
    
    const newAnswers = { ...answers, [questionId]: optionId };
    if (questions && Object.keys(newAnswers).length === questions.length) {
      calculateAndShowSummary();
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

  // 修改 SummaryDialog 组件
  const SummaryDialog = () => (
    <Dialog open={showSummary} onOpenChange={setShowSummary}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">训练完成！</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            让我们看看你的表现如何
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20 
            }}
            className="relative"
          >
            <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center">
              <PartyPopper className="w-16 h-16 text-green-500" />
            </div>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0] 
              }}
              transition={{ 
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="absolute -top-2 -right-2"
            >
              <span className="text-2xl">🎉</span>
            </motion.div>
          </motion.div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">
              恭喜你！
            </h3>
            <p className="text-muted-foreground">
              你已完成本次实词训练
            </p>
          </div>

          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span>准确率</span>
              <span>{accuracy.toFixed(0)}%</span>
            </div>
            <Progress value={accuracy} className="h-2" />
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {accuracy >= 80 ? (
              "太棒了！你对实词的理解已经很到位了！"
            ) : accuracy >= 60 ? (
              "不错的表现！继续加油！"
            ) : (
              "再接再厉，相信你会做得更好！"
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

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
        <SummaryDialog />
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
              
              {/* 修改解析显示部分 */}
              {answers[question.id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <h4 className="text-lg font-semibold mb-2">答案解析</h4>
                  <div className="bg-paper-dark p-4 rounded">
                    <p className="text-ink/80 whitespace-pre-line">
                      {question.explanation}
                    </p>
                  </div>
                </motion.div>
              )}
            </Card>
          ))}
        </div>
        <SummaryDialog />
      </div>
    </div>
  );
};

export default ActualWords;
