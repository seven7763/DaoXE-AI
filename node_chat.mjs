import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DAOXE_API_KEY,
  baseURL: "https://daoxe.com/v1",
});

const response = await client.chat.completions.create({
  model: process.env.DAOXE_MODEL || "MODEL_NAME",
  messages: [
    {
      role: "user",
      content: "Write one practical tip for evaluating LLM APIs.",
    },
  ],
});

console.log(response.choices[0].message.content);

