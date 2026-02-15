const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function getBestAnswer(userQuery, qaList) {
    try {
        const context = qaList.map(item => `Q: ${item.ask}\nA: ${item.answer}`).join('\n\n');

        const prompt = `
You are a helpful assistant for a LINE Bot.
Your goal is to answer user questions based on the provided Q&A list.

Q&A List:
${context}

User Question: "${userQuery}"

Instructions:
1. **Semantic Matching**: specific words might not match exactly. You MUST equate synonyms.
   - Example: "費用" (Cost) is the same as "値段" (Price) or "料金" (Charge).
   - if the user asks "費用は？" and the list has "値段は？", YOU MUST USE THAT ANSWER.
2. **Keyword Handling**: If the user input is a short keyword (e.g., "値段", "費用"), treat it as a query about that topic.
3. **Strict Fallback**: Only if the user's query is *completely unrelated* to any topic in the Q&A list should you decline.
   - If you decline, reply with: "申し訳ありませんが、その質問に対する正確な回答が見つかりませんでした。詳細についてはスタッフに確認してください。"
4. **Output**: Return ONLY the relevant answer from the list. Do not make up facts.
`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error fetching AI response:', error);
        return "申し訳ありません。現在AIシステムに問題が発生しています。";
    }
}

module.exports = { getBestAnswer };
