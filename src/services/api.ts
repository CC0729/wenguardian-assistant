const API_BASE_URL = 'https://api.siliconflow.cn/v1';
const API_KEY = import.meta.env.VITE_API_KEY;

interface QuestionOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface Question {
  id: number;
  word: string;
  context: string;
  type: 'single' | 'multiple';  // 新增题目类型
  options: QuestionOption[];
  analysis: string;  // 新增答案解析
}

export async function generateQuestion(model: string, grade: string): Promise<Question> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: '你是一个文言文教学助手，请根据学生的学段生成适合的实词含义训练题目。每道题目考察一个实词在具体语境中的现代汉语含义。'
          },
          {
            role: 'user',
            content: `请生成一道适合${grade}学生的文言文实词训练题目，要求：
            1. 选取一个适合学段的文言文句子
            2. 标出句中需要考察含义的实词
            3. 提供4个现代汉语含义选项
            格式要求：
            {
              "word": "要考察的实词",
              "context": "包含该实词的完整文言文句子",
              "type": "single",
              "options": [
                {"id": "A", "text": "该实词在此句中的现代汉语含义", "correct": true},
                {"id": "B", "text": "其他可能的含义", "correct": false},
                {"id": "C", "text": "其他可能的含义", "correct": false},
                {"id": "D", "text": "其他可能的含义", "correct": false}
              ],
              "analysis": "解释该实词在此句中为什么是这个含义，可以结合句子上下文或者该实词的常见用法进行说明"
            }`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const question = JSON.parse(data.choices[0].message.content);
    return { ...question, id: Date.now() };
  } catch (error) {
    console.error('Error generating question:', error);
    throw error;
  }
} 