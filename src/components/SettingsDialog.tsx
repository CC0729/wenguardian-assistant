import React, { useState } from "react";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLearning } from "@/contexts/LearningContext";
import { useToast } from "@/hooks/use-toast";

const SettingsDialog = () => {
  const { difficulty, setDifficulty, username, setUsername } = useLearning();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    username: username,
    difficulty: difficulty,
  });

  // 打开对话框时初始化临时设置
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempSettings({
        username: username,
        difficulty: difficulty,
      });
    }
    setOpen(open);
  };

  // 保存设置
  const handleSave = () => {
    setUsername(tempSettings.username);
    setDifficulty(tempSettings.difficulty);
    setOpen(false);
    
    toast({
      description: "设置已保存",
      className: "bg-green-500 text-white",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4">
          <Settings className="h-5 w-5" />
          <span className="sr-only">设置</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>全局设置</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label>用户昵称</Label>
            <Input
              value={tempSettings.username}
              onChange={(e) => 
                setTempSettings(prev => ({
                  ...prev,
                  username: e.target.value
                }))
              }
              placeholder="请输入你的昵称"
            />
          </div>
          <div className="space-y-4">
            <Label>难度设置</Label>
            <RadioGroup
              value={tempSettings.difficulty}
              onValueChange={(value) => 
                setTempSettings(prev => ({
                  ...prev,
                  difficulty: value as "beginner" | "intermediate" | "advanced"
                }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="beginner" />
                <Label htmlFor="beginner">初级</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate">中级</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced">高级</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="mr-2"
          >
            取消
          </Button>
          <Button onClick={handleSave}>
            保存设置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog; 