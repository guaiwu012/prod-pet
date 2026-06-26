import type { AppConfig } from "../types";

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface CompleteTextInput {
  config: AppConfig;
  messages: DeepSeekMessage[];
  fallback: string;
}

export async function completeTextWithFallback({ config, messages, fallback }: CompleteTextInput): Promise<string> {
  const apiKey = config.deepseekApiKey?.trim();
  const baseUrl = config.deepseekBaseUrl?.trim();

  if (!config.aiEnabled || !apiKey || !baseUrl) {
    return fallback;
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.deepseekModel || "deepseek-chat",
        messages,
        temperature: 0.55,
        max_tokens: 420,
      }),
    });

    if (!response.ok) {
      return fallback;
    }

    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return payload.choices?.[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}
