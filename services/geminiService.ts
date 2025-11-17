import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ChatMessage, AnalyticsType, PortfolioData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you would have better error handling or a fallback.
  // For this example, we'll log a warning.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getGeminiChatResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are EDA, a helpful and friendly Economic Decision Assistant for e-commerce sellers.
            Your goal is to provide clear, concise, and actionable advice.
            Use simple language and avoid jargon.
            When asked about a specific topic like 'Sales Forecast', explain the concept and why it's important for their business.
            Keep your responses under 150 words.
            The user's chat history is provided. Your response should follow the last message from the user.`,
        }
    });

    const result: GenerateContentResponse = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch (error) {
    console.error("Error fetching Gemini chat response:", error);
    return "Sorry, I'm having trouble connecting to my brain right now. Please try again later.";
  }
};

export const getMicroLesson = async (topic: AnalyticsType): Promise<string> => {
    const prompt = `Generate a short, practical micro-lesson for an e-commerce seller on the topic of "${topic}".
    The lesson should be structured with:
    1.  A simple definition of the concept.
    2.  Why it is important for their business.
    3.  A bulleted list of 2-3 actionable tips they can implement right away.
    Format the response in Markdown. Use headings, bold text, and bullet points.
    For example, for 'Campaign Suggestion', a tip could be 'Time your campaigns around paydays.'`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating micro-lesson:", error);
        return "I am unable to generate a lesson at this moment. The key takeaway is to analyze your data and make informed decisions.";
    }
}

export const getProductInsight = async (item: PortfolioData): Promise<string> => {
    const { name, salesVolume, profit, profitMargin } = item;
    const prompt = `I am an e-commerce seller analyzing a product from my portfolio.
    - Product Name: ${name}
    - Sales Volume: ${salesVolume.toLocaleString()} units
    - Total Profit: $${profit.toLocaleString()}
    - Profit Margin: ${(profitMargin * 100).toFixed(1)}%

    Based on these metrics, provide a concise and actionable business insight for me.
    For example, if sales are high but margin is low, suggest a price review or bundling. If margin is high but sales are low, suggest a marketing push.
    Keep the insight to 1-2 sentences. Be direct and encouraging.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating product insight:", error);
        return "Could not generate an insight for this product. Consider comparing its performance to other items in your portfolio.";
    }
};