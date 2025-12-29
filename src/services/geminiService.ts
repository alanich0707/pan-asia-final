
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAssistantResponse = async (userPrompt: string, history: { role: 'user' | 'model', text: string }[], lang: 'en' | 'zh' = 'en') => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction: `You are the 汎亞國際 (PAN-ASIA International) Assistant, a helpful AI dedicated to Filipino Migrant Workers in Taiwan.
        The current user language preference is: ${lang === 'en' ? 'English/Tagalog' : 'Traditional Chinese'}.
        
        Guidelines:
        1. If user asks in Chinese, respond in Chinese using the name '汎亞國際'.
        2. If user asks in English or Tagalog, respond in Taglish (English mixed with Tagalog).
        3. Provide accurate information about Taiwan Labor Standards Act (LSA), daily life, and emergency procedures.
        4. Always remain supportive and friendly.
        5. If asked about sensitive legal issues, advise contacting 汎亞國際 (PAN-ASIA) coordinator immediately.
        Keep answers concise.`,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return lang === 'zh' 
      ? "您好，系統暫時出現問題。請稍後再試或直接聯繫您的汎亞服務人員。" 
      : "Mabuhay! I am having some technical trouble. Please try again later or contact your PAN-ASIA coordinator.";
  }
};
