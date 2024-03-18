import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MAX_TOKENS = 16385;

function applyTokenLimit(text) {
  // via: https://platform.openai.com/tokenizer
  // > A helpful rule of thumb is that one token generally corresponds to ~4 characters of text for
  // > common English text. This translates to roughly ¾ of a word (so 100 tokens ~= 75 words).

  const maxLen = MAX_TOKENS * 3.5; // we'll go conservative and assume 3.5 characters per token
  return text.slice(0, maxLen);
}

export async function query(transcription, question) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a skilled meeting analyst. Given the following meeting transcript, answer this specific question:
          
          ${question}`,
      },
      {
        role: "user",
        content: applyTokenLimit(transcription),
      },
    ],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0].message.content;
}
