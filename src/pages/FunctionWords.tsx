
import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLearning } from "@/contexts/LearningContext";
import { useToast } from "@/hooks/use-toast";

const mockExercises = [
  {
    id: 1,
    context: "子曰：「___，吾未见好德如好色者也。」",
    answer: "甚矣",
    hint: "表示感叹的虚词",
  },
  {
    id: 2,
    context: "___入太学，则必以孝悌忠信为本。",
    answer: "凡",
    hint: "表示概括的虚词",
  },
];

const FunctionWords = () => {
  const { grade } = useLearning();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});

  const handleSubmit = (exerciseId: number, answer: string) => {
    const exercise = mockExercises.find((ex) => ex.id === exerciseId);
    if (!exercise) return;

    setAnswers((prev) => ({ ...prev, [exerciseId]: answer }));
    setSubmitted((prev) => ({ ...prev, [exerciseId]: true }));

    if (answer === exercise.answer) {
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

  const getAnswerStatus = (exerciseId: number) => {
    if (!submitted[exerciseId]) return null;
    const exercise = mockExercises.find((ex) => ex.id === exerciseId);
    return exercise?.answer === answers[exerciseId];
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

        <h1 className="text-3xl font-bold text-ink mb-6">虚词训练</h1>
        <p className="text-ink/70 mb-8">
          当前学段：{grade === "elementary" ? "小学" : grade === "junior" ? "初中" : "高中"}
        </p>

        <div className="space-y-8">
          {mockExercises.map((exercise) => (
            <Card key={exercise.id} className="p-6 bg-paper">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">第{exercise.id}题</h3>
                <p className="text-ink/80 bg-paper-dark p-4 rounded">
                  {exercise.context}
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="请填写适当的虚词"
                    className="max-w-xs"
                    value={answers[exercise.id] || ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [exercise.id]: e.target.value }))}
                    disabled={submitted[exercise.id]}
                  />
                  <Button
                    onClick={() => handleSubmit(exercise.id, answers[exercise.id] || "")}
                    disabled={submitted[exercise.id]}
                  >
                    提交答案
                  </Button>
                </div>
                <p className="text-ink/60 text-sm">
                  提示：{exercise.hint}
                </p>
                {submitted[exercise.id] && (
                  <div className={`mt-4 p-3 rounded ${
                    getAnswerStatus(exercise.id) ? "bg-green-100" : "bg-red-100"
                  }`}>
                    <p className="text-ink/80">
                      正确答案：{exercise.answer}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FunctionWords;
