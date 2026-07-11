# DaoXE API examples and low-cost benchmark

[![CI](https://github.com/seven7763/DaoXE-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/seven7763/DaoXE-AI/actions/workflows/ci.yml)

Small, auditable examples for calling [DaoXE](https://daoxe.com), plus a safe
benchmark CLI for checking whether a model works and comparing basic latency.
DaoXE exposes an OpenAI-compatible API at the real base URL:

```text
https://daoxe.com/v1
```

The benchmark uses only built-in Node.js APIs. It never prints or stores the API
key, fixed prompt, or model response. Its report contains only the model ID,
HTTP status, latency, token usage, and a coarse error category.

> **Cost warning:** `smoke` sends one live request. `compare` sends one live
> request per model (two or three requests). These calls may be billed. The
> default maximum output is deliberately limited to 8 tokens; always check the
> current price and your DaoXE balance before running it.

## First successful call

1. Create an account at [daoxe.com](https://daoxe.com) and create an API key in
   the dashboard.
2. Choose an exact, currently available model ID from your DaoXE account.
3. Use Node.js 18 or newer and export the key and model. Do not paste the key
   into source code or command-line arguments.
4. Run the one-request smoke check:

```bash
export DAOXE_API_KEY="your_api_key"
export DAOXE_MODEL="your_exact_model_id"
npm run smoke
```

A successful first call is shown as `ok`, HTTP `200`, with latency and any token
usage returned by the provider. The response text is intentionally not shown.

You can also pass the model ID after the command:

```bash
DAOXE_API_KEY="your_api_key" npm run smoke -- "your_exact_model_id"
```

## Compare two or three models

The command sends requests sequentially and caps the comparison at three unique
models to limit accidental spend:

```bash
export DAOXE_API_KEY="your_api_key"
npm run compare -- "model-id-1" "model-id-2" "model-id-3"
```

Generate a sanitized Markdown or JSON report:

```bash
npm run compare -- "model-id-1" "model-id-2" \
  --format markdown --output benchmark-report.md

npm run smoke -- "model-id-1" \
  --format json --output benchmark-report.json
```

Useful options:

```text
--max-tokens N    1-64; default 8
--timeout-ms N    per-request timeout; default 30000
--format FORMAT   table, json, or markdown
--output FILE     write the sanitized report with owner-only permissions
```

Raising `--max-tokens` can raise the cost. A benchmark run measures only a tiny
request at one point in time; it is not a claim about general model quality or
provider reliability.

## Existing examples

The original examples remain available. Unlike the benchmark, the Node and
Python examples print the model response, so use them only when that is wanted.

### cURL

```bash
export DAOXE_API_KEY="your_api_key"
export DAOXE_MODEL="your_exact_model_id"
./curl-chat.sh
```

### Node.js with the OpenAI SDK

```bash
npm install
npm run chat
```

### Python with the OpenAI SDK

```bash
python -m pip install -r requirements.txt
python python_chat.py
```

## Local tests (no API calls)

```bash
npm test
```

The tests use an in-process mock. They do not require `DAOXE_API_KEY`, do not
connect to DaoXE, and do not consume balance.

---

# Примеры DaoXE API и недорогой бенчмарк

В репозитории собраны простые примеры работы с
[DaoXE](https://daoxe.com) и безопасная CLI-утилита для проверки модели и
сравнения базовой задержки. Реальный OpenAI-совместимый base URL:

```text
https://daoxe.com/v1
```

Бенчмарк использует только встроенные возможности Node.js. Он не выводит и не
сохраняет API-ключ, фиксированный промпт или текст ответа. В отчёт попадают
только ID модели, HTTP-статус, задержка, число токенов и общая категория ошибки.

> **Предупреждение о расходах:** `smoke` отправляет один реальный запрос, а
> `compare` — по одному запросу для каждой из двух или трёх моделей. Запросы
> могут быть платными. По умолчанию ответ ограничен 8 токенами. Перед запуском
> проверьте актуальную цену и баланс DaoXE.

## Первый успешный запрос

1. Создайте аккаунт на [daoxe.com](https://daoxe.com) и выпустите API-ключ в
   личном кабинете.
2. Скопируйте точный ID доступной модели из своего аккаунта DaoXE.
3. Установите Node.js 18 или новее. Передавайте ключ только через переменную
   окружения, а не в исходном коде или аргументах командной строки.
4. Запустите проверку из одного запроса:

```bash
export DAOXE_API_KEY="your_api_key"
export DAOXE_MODEL="your_exact_model_id"
npm run smoke
```

Успешный первый вызов будет отмечен как `ok` и HTTP `200`; рядом появятся
задержка и статистика токенов, если её вернул провайдер. Текст ответа намеренно
не показывается.

Модель также можно передать после команды:

```bash
DAOXE_API_KEY="your_api_key" npm run smoke -- "your_exact_model_id"
```

## Сравнение двух или трёх моделей

Запросы выполняются последовательно, а число уникальных моделей ограничено
тремя, чтобы снизить риск случайных расходов:

```bash
export DAOXE_API_KEY="your_api_key"
npm run compare -- "model-id-1" "model-id-2" "model-id-3"
```

Безопасный отчёт в Markdown или JSON:

```bash
npm run compare -- "model-id-1" "model-id-2" \
  --format markdown --output benchmark-report.md

npm run smoke -- "model-id-1" \
  --format json --output benchmark-report.json
```

Параметры:

```text
--max-tokens N    от 1 до 64; по умолчанию 8
--timeout-ms N    тайм-аут одного запроса; по умолчанию 30000 мс
--format FORMAT   table, json или markdown
--output FILE     сохранить очищенный отчёт с доступом только владельцу
```

Увеличение `--max-tokens` может увеличить стоимость. Короткий тест отражает
только состояние конкретного запроса и не доказывает общее качество модели или
надёжность провайдера.

## Существующие примеры

Исходные примеры сохранены. В отличие от бенчмарка, примеры Node.js и Python
печатают ответ модели — запускайте их только тогда, когда это действительно
нужно.

### cURL

```bash
export DAOXE_API_KEY="your_api_key"
export DAOXE_MODEL="your_exact_model_id"
./curl-chat.sh
```

### Node.js с OpenAI SDK

```bash
npm install
npm run chat
```

### Python с OpenAI SDK

```bash
python -m pip install -r requirements.txt
python python_chat.py
```

## Локальные тесты без расходов

```bash
npm test
```

Тесты работают с локальным mock-ответом, не требуют `DAOXE_API_KEY`, не
подключаются к DaoXE и не расходуют баланс.

## Русскоязычный канал

Telegram: [@daoxe_api_ru](https://t.me/daoxe_api_ru)
