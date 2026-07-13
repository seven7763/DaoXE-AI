# Use DaoXE with coding clients (OpenAI-compatible and Claude protocol)

DaoXE is a multi-model multi-protocol API gateway. Many clients connect through
the OpenAI-compatible Chat Completions endpoint; DaoXE also exposes **OpenAI
Responses**, **Anthropic Messages (Claude protocol)**, and OpenAI-compatible
image generation for other tools.

- **Base URL:** `https://daoxe.com/v1`
- **API key:** create and copy your own key after signing in to
  [DaoXE](https://daoxe.com)
- **Model ID:** copy an exact model ID that is currently available to your
  DaoXE account; the public [models and pricing page](https://daoxe.com/pricing)
  is useful for discovery, but your account's current model list is
  authoritative

Never paste a real API key into source control, screenshots, issue reports, or
shared configuration files. A request from one of these clients may be billed.

> DaoXE is configured below through each client's generic OpenAI-compatible
> option. This guide does **not** claim that DaoXE is a built-in provider or an
> official integration in any of these clients.

## Cline

1. Open Cline in VS Code and select the gear icon to open its settings.
2. Set **API Provider** to **OpenAI Compatible**.
3. Enter `https://daoxe.com/v1` in **Base URL**.
4. Enter the API key created in your DaoXE account in **API Key**.
5. Enter an exact currently available DaoXE model ID in **Model**.

These fields and the OpenAI-compatible provider flow are documented in
[Cline's official provider guide](https://github.com/cline/cline/blob/63099710895e24593554b1e77ec7852f6f16c05c/docs/provider-config/openai-compatible.mdx).

## Roo Code

1. Open Roo Code in VS Code and select the gear icon to open its settings.
2. Set **API Provider** to **OpenAI Compatible**.
3. Enter `https://daoxe.com/v1` in **Base URL**.
4. Enter the API key created in your DaoXE account in **API Key**.
5. Choose or enter an exact currently available DaoXE model ID in **Model**.

Roo Code requires native OpenAI-compatible tool calling, so choose a model that
supports tool/function calling when you want Roo Code to act on files or run
tools. See the
[official Roo Code OpenAI-compatible provider guide](https://github.com/RooCodeInc/Roo-Code-Docs/blob/a676c4173ae60348095efaebfd1292a9617622c0/docs/providers/openai-compatible.md).

## Continue

Add a model entry to Continue's `config.yaml`, replacing both placeholders with
values from your own DaoXE account:

```yaml
name: DaoXE Config
version: 0.0.1
schema: v1

models:
  - name: DaoXE
    provider: openai
    model: <DAOXE_MODEL_ID>
    apiBase: https://daoxe.com/v1
    apiKey: <DAOXE_API_KEY>
```

Save the configuration and reload it in the Continue IDE extension. Continue's
official OpenAI provider documentation explicitly supports OpenAI-compatible
providers by changing `apiBase`; see the
[official configuration reference](https://github.com/continuedev/continue/blob/d0a3c0b626b5bebc3bef4742eec05a0242be0bab/docs/customize/model-providers/top-level/openai.mdx).



## Aider

DaoXE works with Aider through the OpenAI-compatible API path:

```bash
export OPENAI_API_BASE=https://daoxe.com/v1
export OPENAI_API_KEY=<DAOXE_API_KEY>
cd /to/your/project
aider --model openai/<DAOXE_MODEL_ID>
```

Use an exact model ID currently available to your DaoXE account. Aider may show
model-warning messages for unfamiliar IDs; that is expected for gateway catalogs.

Public Aider docs PR (if merged): https://github.com/Aider-AI/aider/pull/5438

## LibreChat

Add a custom endpoint in `librechat.yaml` (see LibreChat docs for the full file):

```yaml
endpoints:
  custom:
    - name: 'DaoXE'
      apiKey: '${DAOXE_API_KEY}'
      baseURL: 'https://daoxe.com/v1'
      models:
        default: ['placeholder-model-id']
        fetch: true
      titleConvo: true
      titleModel: 'current_model'
      modelDisplayLabel: 'DaoXE'
```

Set `DAOXE_API_KEY` in your environment. Keep `fetch: true` so model IDs come from
authenticated `GET /v1/models` instead of a hardcoded list.

Public LibreChat docs PR (if merged): https://github.com/danny-avila/LibreChat/pull/14222

## Open WebUI

In **Admin Settings → Connections**, add an OpenAI-compatible connection:

- **URL:** `https://daoxe.com/v1`
- **API Key:** your DaoXE key
- **Model IDs:** leave empty for auto-discovery via `/models`, or allowlist exact IDs

Open WebUI uses the OpenAI Chat Completions protocol path. DaoXE also exposes
OpenAI Responses and Anthropic Messages endpoints for other clients.

## Claude Code / Anthropic Messages (Claude protocol)

DaoXE supports the **Claude / Anthropic Messages** protocol, not only
OpenAI-compatible Chat Completions. Use this path for Claude Code, Anthropic
SDKs, and tools that speak Messages (for example some Claude Code provider
managers). This is a protocol choice; it does **not** mean DaoXE only serves
Claude models.

Public endpoint shape (same host, Messages path):

```text
Base URL:  https://daoxe.com
Messages:  POST https://daoxe.com/v1/messages
```

Typical headers for a minimal request:

```text
x-api-key: <DAOXE_API_KEY>
anthropic-version: 2023-06-01
content-type: application/json
```

Minimal body:

```json
{
  "model": "<DAOXE_MODEL_ID>",
  "max_tokens": 8,
  "messages": [
    { "role": "user", "content": "Reply with OK." }
  ]
}
```

cURL smoke (may be billed; keep `max_tokens` tiny):

```bash
export DAOXE_API_KEY="your_api_key"
export DAOXE_MODEL="your_exact_model_id"

curl --fail-with-body --show-error --silent \
  -H "x-api-key: $DAOXE_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$DAOXE_MODEL\",
    \"max_tokens\": 8,
    \"messages\": [{\"role\":\"user\",\"content\":\"Reply with OK.\"}]
  }" \
  "https://daoxe.com/v1/messages"
```

Notes:

- Prefer an exact model ID from the catalog available to **your** account.
- Client UIs differ: some want base `https://daoxe.com`, others
  `https://daoxe.com/v1`. Match the client docs; the Messages path remains
  `/v1/messages`.
- Related discussion: [CC Switch DaoXE universal preset](https://github.com/farion1231/cc-switch/issues/5258).
- Postman starter: `postman/DaoXE.postman_collection.json` → **Anthropic - Messages**.

## Multi-protocol note

DaoXE is multi-model and multi-protocol: OpenAI Chat Completions, OpenAI
Responses, Anthropic Messages (Claude protocol), and OpenAI-compatible image
generation where available. It is not OpenAI-only and not limited to
OpenAI/Claude model families. Exact model IDs depend on your account catalog.
Prefer live discovery over hardcoded lists.

## Troubleshooting

- **401 or invalid key:** create or copy the key again from your DaoXE account
  and make sure no spaces were added.
- **Model not found:** copy the model ID again from the current model list
  available to your account. Do not guess a model name from an old example.
- **Tool-call errors:** choose a currently available model that supports the
  tool/function-calling features required by the client.
- **Connection errors:** confirm the base URL is exactly
  `https://daoxe.com/v1` and that the client can reach `daoxe.com`.

The client steps above were checked against the linked official documentation
on 2026-07-11. Client interfaces can change, so use the linked upstream guide
if a label has moved.

## 简体中文摘要

在客户端中选择通用的 **OpenAI Compatible** 配置，Base URL 填
`https://daoxe.com/v1`。若客户端走 **Claude / Anthropic Messages** 协议，则请求
`https://daoxe.com/v1/messages`（`x-api-key` + `anthropic-version`）。API Key
必须由你登录 DaoXE 后自行创建；模型 ID 必须从当前账户可用模型列表中复制，不要
照抄旧示例。本文不代表 DaoXE 已经是 Cline、Roo Code、Continue 或 Claude Code 的
内置 Provider。

## Кратко по-русски

Выберите в клиенте универсальный режим **OpenAI Compatible** и укажите
`https://daoxe.com/v1` как Base URL. Для протокола **Claude / Anthropic Messages**
используйте `https://daoxe.com/v1/messages`. Создайте API-ключ в своём аккаунте
DaoXE и скопируйте точный ID модели из актуального списка, доступного вашему
аккаунту. Эта инструкция не означает, что DaoXE встроен в Cline, Roo Code,
Continue или Claude Code.
