import os

from openai import OpenAI

api_key = os.environ.get("DAOXE_API_KEY")
model = os.environ.get("DAOXE_MODEL")

if not api_key or not model:
    raise SystemExit("Set DAOXE_API_KEY and DAOXE_MODEL before running this example.")

client = OpenAI(
    api_key=api_key,
    base_url="https://daoxe.com/v1",
)

response = client.chat.completions.create(
    model=model,
    max_tokens=64,
    messages=[
        {
            "role": "user",
            "content": "Write one practical tip for evaluating LLM APIs.",
        }
    ],
)

print(response.choices[0].message.content)
