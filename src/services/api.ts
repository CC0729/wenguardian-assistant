export interface Question {
  id: number;
  word: string;
  context: string;
  options: {
    id: string;
    text: string;
    correct: boolean;
  }[];
  explanation: string;
}

export interface ApiConfig {
  model: string;
}

export const defaultConfig: ApiConfig = {
  model: import.meta.env.VITE_DEFAULT_MODEL || "Qwen/Qwen2-VL-72B-Instruct"
};

export async function callLLM(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  config: ApiConfig = defaultConfig
) {
  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SILICON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        stream: false,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('API调用错误:', error);
    throw error;
  }
} 