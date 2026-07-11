import OpenAI from "openai";

const apiKey = process.env.DAOXE_API_KEY;
const model = process.env.DAOXE_MODEL;

if (!apiKey || !model) {
  console.error("Set DAOXE_API_KEY and DAOXE_MODEL before running this example.");
  process.exit(2);
}

const client = new OpenAI({
  apiKey,
  baseURL: "https://daoxe.com/v1",
});

const response = await client.chat.completions.create({
  model,
  max_tokens: 64,
  messages: [
    {
      role: "user",
      content: "Write one practical tip for evaluating LLM APIs.",
    },
  ],
});

console.log(response.choices[0].message.content);
