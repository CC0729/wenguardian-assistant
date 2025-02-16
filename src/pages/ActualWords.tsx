import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLearning } from "@/contexts/LearningContext";
import { useToast } from "@/hooks/use-toast";
import { generateQuestion, Question } from "@/services/api";
import StreamingLoader from "@/components/StreamingLoader";

const QUESTIONS_COUNT = 5;

const ActualWords = () => {
  const { grade, model } = useLearning();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // 页面加载时自动生成题目
  useEffect(() => {
    generateQuestions();
  }, []);

  // 生成所有题目
  const generateQuestions = async () => {
    setLoading(true);
    setQuestions([]);
    setSelectedAnswers({});
    setSubmittedQuestions(new Set());
    setCurrentStep(0);

    try {
      const newQuestions: Question[] = [];
      
      for (let i = 0; i < QUESTIONS_COUNT; i++) {
        setCurrentStep(i + 1);
        const question = await generateQuestion(model, grade);
        newQuestions.push(question);
        
        // 逐个显示题目
        setQuestions(prev => [...prev, question]);
        
        // 添加随机延迟，模拟真实的流式生成效果
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      }

      toast({
        description: "题目生成完成！",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast({
        description: "生成题目失败，请刷新重试",
        className: "bg-red-500 text-white",
      });
    } finally {
      setLoading(false);
      setCurrentStep(0);
    }
  };

  // 处理选项选择
  const handleOptionSelect = (questionId: number, optionId: string) => {
    if (submittedQuestions.has(questionId)) return;

    setSelectedAnswers(prev => {
      const question = questions.find(q => q.id === questionId);
      if (!question) return prev;

      if (question.type === 'single') {
        // 单选题直接替换答案
        return { ...prev, [questionId]: [optionId] };
      } else {
        // 多选题切换选项
        const currentAnswers = prev[questionId] || [];
        const newAnswers = currentAnswers.includes(optionId)
          ? currentAnswers.filter(id => id !== optionId)
          : [...currentAnswers, optionId];
        return { ...prev, [questionId]: newAnswers };
      }
    });
  };

  // 提交答案
  const handleSubmit = (questionId: number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const userAnswers = selectedAnswers[questionId] || [];
    const correctAnswers = question.options
      .filter(opt => opt.correct)
      .map(opt => opt.id);

    const isCorrect = userAnswers.length === correctAnswers.length &&
      userAnswers.every(ans => correctAnswers.includes(ans));

    setSubmittedQuestions(prev => new Set(prev).add(questionId));

    toast({
      description: isCorrect ? "回答正确！" : "答案不正确，请查看解析！",
      className: isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white",
    });
  };

  // 检查答案是否已选择
  const hasSelectedAnswer = (questionId: number) => {
    return (selectedAnswers[questionId]?.length || 0) > 0;
  };

  return (
    <div className="min-h-screen bg-paper-light">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-ink hover:text-ink/70">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Link>
        </div>

        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-ink">实词训练</h1>
          <Button 
            onClick={generateQuestions}
            disabled={loading}
          >
            重新生成题目
          </Button>
        </div>

        <p className="text-ink/70 mb-8">
          当前学段：{grade === "elementary" ? "小学" : grade === "junior" ? "初中" : "高中"}
        </p>

        {loading && currentStep > 0 && (
          <StreamingLoader currentStep={currentStep} totalSteps={QUESTIONS_COUNT} />
        )}

        <AnimatePresence mode="popLayout">
          <div className="space-y-8">
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card className="p-6 bg-paper">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2">
                      第{index + 1}题：请选择"<span className="text-primary">{question.word}</span>"在句中的含义
                    </h3>
                    <div className="space-y-2">
                      <p className="text-ink/80 bg-paper-dark p-4 rounded">
                        {question.context.split(question.word).map((part, i, arr) => (
                          <React.Fragment key={i}>
                            {part}
                            {i < arr.length - 1 && (
                              <span className="text-primary font-bold">{question.word}</span>
                            )}
                          </React.Fragment>
                        ))}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {question.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="radio"
                          id={`${question.id}-${option.id}`}
                          name={`question-${question.id}`}
                          checked={selectedAnswers[question.id]?.includes(option.id)}
                          onChange={() => handleOptionSelect(question.id, option.id)}
                          disabled={submittedQuestions.has(question.id)}
                          className="w-4 h-4"
                        />
                        <label
                          htmlFor={`${question.id}-${option.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.id}. {option.text}
                        </label>
                      </div>
                    ))}

                    <Button
                      onClick={() => handleSubmit(question.id)}
                      disabled={!hasSelectedAnswer(question.id) || submittedQuestions.has(question.id)}
                      className="mt-4"
                    >
                      提交答案
                    </Button>

                    {submittedQuestions.has(question.id) && (
                      <div className="mt-4 p-4 bg-paper-dark rounded">
                        <h4 className="font-medium text-ink mb-2">答案解析</h4>
                        <p className="text-ink/80">{question.analysis}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActualWords;
