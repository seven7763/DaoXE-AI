import os

from openai import OpenAI


client = OpenAI(
    api_key=os.environ["DAOXE_API_KEY"],
    base_url="https://daoxe.com/v1",
)

response = client.chat.completions.create(
    model=os.environ.get("DAOXE_MODEL", "MODEL_NAME"),
    messages=[
        {
            "role": "user",
            "content": "Write one practical tip for evaluating LLM APIs.",
        }
    ],
)

print(response.choices[0].message.content)

