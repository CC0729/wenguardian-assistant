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
  const { grade, setGrade, username, setUsername } = useLearning();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    username: username,
    grade: grade,
  });

  // 打开对话框时初始化临时设置
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempSettings({
        username: username,
        grade: grade,
      });
    }
    setOpen(open);
  };

  // 保存设置
  const handleSave = () => {
    setUsername(tempSettings.username);
    setGrade(tempSettings.grade);
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
            <Label>学段设置</Label>
            <RadioGroup
              value={tempSettings.grade}
              onValueChange={(value) => 
                setTempSettings(prev => ({
                  ...prev,
                  grade: value as "elementary" | "junior" | "senior"
                }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="elementary" id="elementary" />
                <Label htmlFor="elementary">小学</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="junior" id="junior" />
                <Label htmlFor="junior">初中</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="senior" id="senior" />
                <Label htmlFor="senior">高中</Label>
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