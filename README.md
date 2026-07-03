# DaoXE Examples

Examples for using DaoXE as an OpenAI-compatible API gateway for different AI models.

DaoXE lets an app keep the familiar OpenAI SDK request format while changing the API endpoint and model name. This is useful when you want to compare models, latency, cost, and stability without rewriting business logic.

Website: https://daoxe.com

## Quick Start

Create an API key in DaoXE, then set:

```bash
export DAOXE_API_KEY="your_api_key"
export DAOXE_MODEL="model_name"
```

The base URL is:

```text
https://daoxe.com/v1
```

## cURL

```bash
curl https://daoxe.com/v1/chat/completions \
  -H "Authorization: Bearer $DAOXE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "'"$DAOXE_MODEL"'",
    "messages": [
      {"role": "user", "content": "Write one sentence about OpenAI-compatible APIs."}
    ]
  }'
```

## Python

```bash
pip install -r requirements.txt
python python_chat.py
```

## Node.js

```bash
npm install
node node_chat.mjs
```

## Русский

DaoXE позволяет подключать разные AI-модели через один OpenAI-compatible endpoint. Если ваш код уже использует OpenAI SDK, обычно достаточно заменить `base_url`, API key и название модели.

Полезно проверять модели на своих реальных задачах:

- качество ответа;
- latency;
- стоимость;
- стабильность;
- ошибки и fallback-сценарии.

## Русскоязычный канал

Telegram: https://t.me/daoxe_api_ru
