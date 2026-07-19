# DaoXE — примеры OpenAI-совместимого API и недорогой бенчмарк

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [**Русский**](README.ru.md)

**DaoXE** — это OpenAI-совместимый мультимодельный мультипротокольный **шлюз
нейросетей**: один `base_url` и один ключ дают доступ к **Claude / GPT / Gemini /
DeepSeek / Kimi / Qwen / Doubao**. Поддерживаются три протокола — OpenAI Chat
Completions, OpenAI Responses и **Anthropic Messages (Claude-протокол)**.

```text
https://daoxe.com/v1
```

> **Раскрытие и доступность:** DaoXE — сервис, который мы ведём. Он **недоступен в
> материковом Китае**. Русский — это **языковой** канал для русскоязычных
> разработчиков (СНГ и релоканты по всему миру), а не geo-таргетинг «только РФ».

## Быстрый старт (единый API для нейросетей)

1. Зарегистрируйтесь на [daoxe.com](https://daoxe.com/?utm_source=github&utm_medium=organic&utm_campaign=daoxe_ai&utm_content=readme_ru_quickstart&utm_term=ru) и выпустите API-ключ.
2. Получите точные ID моделей своего аккаунта:

```bash
export DAOXE_API_KEY="ваш_ключ"
export DAOXE_BASE_URL="https://daoxe.com/v1"
curl -sS -H "Authorization: Bearer $DAOXE_API_KEY" "$DAOXE_BASE_URL/models"
```

3. Первый запрос (OpenAI-совместимый Chat Completions):

```bash
curl -sS "$DAOXE_BASE_URL/chat/completions" \
  -H "Authorization: Bearer $DAOXE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"ТОЧНЫЙ_ID_МОДЕЛИ","max_tokens":8,
       "messages":[{"role":"user","content":"ping"}]}'
```

## Подключение инструментов (доступ к Claude / GPT / Gemini API)

Ниже — минимальные настройки. Полные инструкции для ~50 клиентов (Cline, Roo
Code, Continue, Aider, DeepChat, Dify, LiteLLM и др.) — в
[**CLIENT_SETUP.md**](CLIENT_SETUP.md), а также [**Claude Code**](CLAUDE_CODE.md).

**Cursor** — Settings → Models → включить **OpenAI API Key**, задать
**Override OpenAI Base URL** = `https://daoxe.com/v1`, добавить точные ID моделей.

**Claude Code** (нативный Claude-протокол через Anthropic Messages):

```bash
export ANTHROPIC_BASE_URL="https://daoxe.com"   # корень хоста; клиент сам добавит /v1/messages
export ANTHROPIC_AUTH_TOKEN="ваш_ключ"
```

**Cline / Roo Code** — провайдер **OpenAI Compatible**, Base URL
`https://daoxe.com/v1`, ключ + точный ID модели.

## Бенчмарк и цены

Безопасная CLI-утилита в этом репозитории измеряет доступность и задержку и **не
сохраняет ключ, промпт и ответ** (см. раздел бенчмарка в [README](README.md)).
Живая таблица задержки / доступности / цены по моделям —
[**llm-gateway-benchmark**](https://github.com/seven7763/llm-gateway-benchmark).

- Стартовый бонус при регистрации: `{{FREE_CREDIT}}` *(уточняется)*
- Поддержка / русскоязычный канал: Telegram [@daoxe_ai](https://t.me/daoxe_ai)

## Ключевые слова

OpenAI-совместимый API · шлюз нейросетей · агрегатор нейросетей · доступ к Claude
API · доступ к ChatGPT / GPT API · доступ к Gemini API · единый API для нейросетей
· Anthropic Messages · Claude-протокол · подключение через base_url и ключ ·
Cursor · Claude Code · Cline.
