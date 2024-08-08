import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateSummary(sessionId, messages) {
  try {
    const prompt = `다음 대화를 요약해주세요. 주요 토픽과 핵심 포인트를 중점적으로 한 문장으로 간결하게 요약해주세요 "~~에 대한 면접 대화" 이런식으로 간결하게:

        ${messages
          .map((m) => `Q: ${m.question}\nA: ${m.answer}`)
          .join("\n\n")}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "너는 대화를 요약하는 gpt야" },
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const summary = response.choices[0].message.content.trim();
    return { updated: true, summary };
  } catch (error) {
    console.error("Error generating summary:", error);
    return { updated: false, error: error.message };
  }
}

export { generateSummary };
