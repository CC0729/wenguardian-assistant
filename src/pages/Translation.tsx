import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLearning } from "@/contexts/LearningContext";

const mockPassages = [
  {
    id: 1,
    title: "《劝学》节选",
    content: "故不积跬步，无以至千里；不积小流，无以成江海。骐骥一跃，不能十步；驽马十驾，功在不舍。",
    reference: "所以不积累一步一步的脚印，就不可能达到千里之远；不积累小溪流水，就不可能汇成江河大海。即使是千里马一跃，也不能超过十步；劣马经过长期驾驭，也能走得很远，关键在于不停步。",
  },
];

const Translation = () => {
  const { grade } = useLearning();

  return (
    <div className="min-h-screen bg-paper-light">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-ink hover:text-ink/70">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-ink mb-6">翻译练习</h1>
        <p className="text-ink/70 mb-8">
          当前学段：{grade === "elementary" ? "小学" : grade === "junior" ? "初中" : "高中"}
        </p>

        <div className="space-y-8">
          {mockPassages.map((passage) => (
            <Card key={passage.id} className="p-6 bg-paper">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">{passage.title}</h3>
                <div className="bg-paper-dark p-4 rounded mb-4">
                  <p className="text-ink/80 text-lg">{passage.content}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink/70 mb-2">
                    你的翻译
                  </label>
                  <Textarea
                    placeholder="请输入你的翻译..."
                    className="min-h-[120px]"
                  />
                </div>
                
                <Button className="w-full">提交翻译</Button>
                
                <div className="mt-6 p-4 bg-paper-dark rounded">
                  <h4 className="font-medium text-ink mb-2">参考译文</h4>
                  <p className="text-ink/80">{passage.reference}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Translation;
