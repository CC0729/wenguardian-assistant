import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor, DragOverlay } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLearning } from "@/contexts/LearningContext";
import { useToast } from "@/hooks/use-toast";
import FunctionWordOption, { DraggingWordPreview } from "@/components/FunctionWordOption";
import DroppableBlank from "@/components/DroppableBlank";

const mockExercises = [
  {
    id: 1,
    text: ["子曰：", "，吾未见好德如好色者也。"],
    blanks: [{ id: "blank-1", answer: "甚矣" }],
    options: ["甚矣", "诚然", "固然", "果然"],
    hint: "表示感叹的虚词",
  },
  {
    id: 2,
    text: ["", "入太学，则必以孝悌忠信为本。"],
    blanks: [{ id: "blank-2", answer: "凡" }],
    options: ["凡", "夫", "且", "盖"],
    hint: "表示概括的虚词",
  },
];

const FunctionWords = () => {
  const { difficulty } = useLearning();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDraggingWord, setActiveDraggingWord] = useState<string | null>(null);

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px的移动距离后才开始拖拽
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveDraggingWord(active.data.current?.word || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.data.current) {
      setAnswers(prev => ({
        ...prev,
        [over.id]: active.data.current.word
      }));
    }
    
    setActiveId(null);
    setActiveDraggingWord(null);
  };

  const handleSubmit = (exerciseId: number) => {
    const exercise = mockExercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    const isCorrect = exercise.blanks.every(
      blank => answers[blank.id] === blank.answer
    );

    setSubmitted(prev => ({ ...prev, [exerciseId]: true }));

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
          当前难度：{difficulty === "beginner" ? "初级" : difficulty === "intermediate" ? "中级" : "高级"}
        </p>

        <div className="space-y-8">
          {mockExercises.map((exercise) => (
            <Card key={exercise.id} className="p-6 bg-paper">
              <DndContext 
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">第{exercise.id}题</h3>
                  <p className="text-ink/80 bg-paper-dark p-4 rounded text-lg leading-loose">
                    {exercise.text.map((segment, index) => (
                      <React.Fragment key={index}>
                        {segment}
                        {index < exercise.blanks.length && (
                          <DroppableBlank
                            id={exercise.blanks[index].id}
                            value={answers[exercise.blanks[index].id]}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-ink/70 mb-2">
                      可选虚词：
                    </p>
                    <div className="flex flex-wrap gap-2 items-center">
                      {exercise.options.map((option, index) => (
                        <FunctionWordOption
                          key={`${exercise.id}-${index}`}
                          id={`option-${exercise.id}-${index}`}
                          word={option}
                          isUsed={Object.values(answers).includes(option)}
                          isDragging={activeId === `option-${exercise.id}-${index}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-ink/60 text-sm">
                    提示：{exercise.hint}
                  </p>

                  <Button
                    onClick={() => handleSubmit(exercise.id)}
                    disabled={submitted[exercise.id]}
                    className="mt-4"
                  >
                    提交答案
                  </Button>

                  {submitted[exercise.id] && (
                    <div className={`mt-4 p-3 rounded ${
                      exercise.blanks.every(blank => answers[blank.id] === blank.answer)
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}>
                      <p className="text-ink/80">
                        正确答案：
                        {exercise.blanks.map((blank, index) => (
                          <span key={blank.id}>
                            {index > 0 && "、"}
                            {blank.answer}
                          </span>
                        ))}
                      </p>
                    </div>
                  )}
                </div>

                {activeDraggingWord && (
                  <DragOverlay dropAnimation={{
                    duration: 200,
                    easing: 'ease',
                  }}>
                    <DraggingWordPreview word={activeDraggingWord} />
                  </DragOverlay>
                )}
              </DndContext>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FunctionWords;
