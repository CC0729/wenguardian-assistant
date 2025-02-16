
import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLearning } from "@/contexts/LearningContext";
import { useToast } from "@/hooks/use-toast";

const mockQuestions = [
  {
    id: 1,
    word: "然",
    context: "事虽小，勿谓何伤，当思端绪，慎其所先，迨其既衍，靡从振援，吾是以惧，兢兢业业，直至于今。然犹未也。",
    options: [
      { id: "A", text: "因此", correct: true },
      { id: "B", text: "但是", correct: false },
      { id: "C", text: "如此", correct: false },
      { id: "D", text: "虽然", correct: false },
    ],
  },
  {
    id: 2,
    word: "盖",
    context: "盖闻善贾者不望折阅之费，而计久远之利。",
    options: [
      { id: "A", text: "大概", correct: false },
      { id: "B", text: "覆盖", correct: false },
      { id: "C", text: "大凡", correct: true },
      { id: "D", text: "可能", correct: false },
    ],
  },
];

const ActualWords = () => {
  const { difficulty } = useLearning();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<number, string>>({});

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
          当前难度：{difficulty === "beginner" ? "初级" : difficulty === "intermediate" ? "中级" : "高级"}
        </p>

        <div className="space-y-8">
          {mockQuestions.map((question) => (
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
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActualWords;
