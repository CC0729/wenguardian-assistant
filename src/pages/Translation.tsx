import React, { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLearning } from "@/contexts/LearningContext";
import { useQuery } from "@tanstack/react-query";
import { callLLM } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface TranslationQuestion {
  id: number;
  text: string;
  reference: string;
}

interface TranslationFeedback {
  score: number;
  analysis: string;
}

const Translation = () => {
  const { grade, apiConfig } = useLearning();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, TranslationFeedback>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  const generatePrompt = (grade: string) => {
    return `请根据${grade === "elementary" ? "小学" : grade === "junior" ? "初中" : "高中"}学段的要求，生成3段文言文翻译题。
每道题目需要包含：
1. 原文（文言文）
2. 参考译文（现代汉语）

请按照以下 JSON 格式返回：
{
  "questions": [
    {
      "id": 1,
      "text": "文言文原文",
      "reference": "参考译文"
    }
  ]
}`;
  };

  const { data: questions, isLoading } = useQuery<TranslationQuestion[]>({
    queryKey: ['translation', grade, apiConfig.model],
    queryFn: async () => {
      const response = await callLLM([
        { role: 'user', content: generatePrompt(grade) }
      ], apiConfig);
      
      try {
        const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        const parsed = JSON.parse(cleanResponse);
        return parsed.questions;
      } catch (e) {
        console.error('解析响应失败:', e);
        throw new Error('生成题目失败，请重试');
      }
    },
  });

  const handleSubmit = async (questionId: number) => {
    const userTranslation = answers[questionId];
    if (!userTranslation || !questions) return;

    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    setLoading(prev => ({ ...prev, [questionId]: true }));

    try {
      const prompt = `请对以下文言文翻译进行评价：

原文：${question.text}
参考译文：${question.reference}
用户翻译：${userTranslation}

请从以下几个方面进行分析：
1. 翻译准确性
2. 用词恰当性
3. 语言流畅度
4. 理解深度

请按照以下格式返回评价：
{
  "score": 分数（100分制）,
  "analysis": "详细分析（包含优点和需要改进的地方）"
}`;

      const response = await callLLM([
        { role: 'user', content: prompt }
      ], apiConfig);

      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const feedback = JSON.parse(cleanResponse);
      
      setFeedbacks(prev => ({
        ...prev,
        [questionId]: feedback
      }));
    } catch (error) {
      console.error('评价生成失败:', error);
    } finally {
      setLoading(prev => ({ ...prev, [questionId]: false }));
    }
  };

  // 添加加载状态提示数组
  const loadingSteps = [
    "正在连接到AI模型...",
    "正在生成适合学段的文言文...",
    "正在优化文本难度...",
    "正在编写参考译文...",
    "马上就好..."
  ];

  const [currentStep, setCurrentStep] = useState(0);

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

          <h1 className="text-3xl font-bold text-ink mb-6">翻译训练</h1>
          <p className="text-ink/70 mb-8">
            当前学段：{grade === "elementary" ? "小学" : grade === "junior" ? "初中" : "高中"}
          </p>

          <div className="space-y-8">
            {[1, 2, 3].map((index) => (
              <Card key={index} className="p-6 bg-paper relative overflow-hidden">
                <div className="mb-6">
                  <Skeleton className="h-8 w-1/4 mb-4" />
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-40 w-full" />
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
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{loadingSteps[currentStep]}</span>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </Card>
            ))}
          </div>

          {/* 添加底部加载提示 */}
          <motion.div 
            className="mt-8 text-center text-ink/60"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p>正在为你准备适合的翻译练习题目</p>
            <p className="text-sm mt-2">这可能需要一点时间，请耐心等待</p>
          </motion.div>
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

        <h1 className="text-3xl font-bold text-ink mb-6">翻译训练</h1>
        <p className="text-ink/70 mb-8">
          当前学段：{grade === "elementary" ? "小学" : grade === "junior" ? "初中" : "高中"}
        </p>

        <div className="space-y-8">
          {questions?.map((question) => (
            <Card key={question.id} className="p-6 bg-paper">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">第{question.id}题</h3>
                <p className="text-ink/80 bg-paper-dark p-4 rounded whitespace-pre-line">
                  {question.text}
                </p>
              </div>

              <div className="space-y-4">
                <Textarea
                  placeholder="请输入你的翻译..."
                  className="min-h-[120px]"
                  value={answers[question.id] || ''}
                  onChange={(e) => setAnswers(prev => ({
                    ...prev,
                    [question.id]: e.target.value
                  }))}
                />

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSubmit(question.id)}
                    disabled={loading[question.id] || !answers[question.id]}
                  >
                    {loading[question.id] ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        评价中...
                      </>
                    ) : '提交翻译'}
                  </Button>
                </div>

                <AnimatePresence>
                  {feedbacks[question.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4"
                    >
                      <div className="bg-paper-dark p-4 rounded space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold">评价结果</h4>
                          <span className="text-lg font-bold">
                            {feedbacks[question.id].score}/100
                          </span>
                        </div>
                        <p className="text-ink/80 whitespace-pre-line">
                          {feedbacks[question.id].analysis}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Translation;
