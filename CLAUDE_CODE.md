# Use Claude Code with DaoXE (Anthropic Messages / Claude protocol)

> **Disclosure and availability:** DaoXE is a multi-model, multi-protocol API
> gateway we operate. It speaks OpenAI Chat Completions, OpenAI Responses,
> **Anthropic Messages (Claude protocol)**, and OpenAI-compatible image
> generation where available. It is **not** available in mainland China. This
> guide is for developers in regions allowed by the service terms.

[Anthropic's Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI
talks to an Anthropic **Messages** endpoint. Because DaoXE exposes the Claude
protocol at `https://daoxe.com/v1/messages`, you can point Claude Code at DaoXE
with two environment variables. No proxy, router, or code change is required.

This is a protocol choice. It does **not** mean DaoXE only serves Claude models
— the same account also speaks OpenAI Chat Completions, Responses, and image
endpoints for other clients.

## 1. Create a key and discover a model

Create an API key in your [DaoXE](https://daoxe.com/?utm_source=github&utm_medium=organic&utm_campaign=claude_code) dashboard, then list the model IDs your account can actually call. Do not
hardcode a model name copied from a blog.

```bash
export DAOXE_API_KEY="your_api_key"

curl --fail-with-body --show-error --silent \
  -H "Authorization: Bearer $DAOXE_API_KEY" \
  "https://daoxe.com/v1/models"
```

Copy one exact ID from the response for the next step.

## 2. Smoke-test the Messages path before touching Claude Code

Verify the raw protocol first. If this fails, fixing Claude Code settings will
not help. Keep `max_tokens` tiny; this request may be billed.

```bash
export DAOXE_MODEL="paste_exact_model_id_here"

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

- **Pass:** HTTP 200 with a short assistant payload or usage metadata.
- **Fail:** auth error, model-not-found, wrong path, or an HTML error page.

## 3. Point Claude Code at DaoXE

Claude Code reads its endpoint and credentials from environment variables.
Set the base URL to the DaoXE host root — Claude Code appends `/v1/messages`
itself.

```bash
export ANTHROPIC_BASE_URL="https://daoxe.com"
export ANTHROPIC_AUTH_TOKEN="your_api_key"
```

Then run Claude Code as usual:

```bash
claude
```

Notes:

- `ANTHROPIC_BASE_URL` is the **host root** (`https://daoxe.com`), not
  `https://daoxe.com/v1`. Claude Code builds the `/v1/messages` path.
- Some Claude Code versions read `ANTHROPIC_API_KEY` instead of
  `ANTHROPIC_AUTH_TOKEN`. If auth fails, export both to the same key.
- To pin a specific catalog model, set `ANTHROPIC_MODEL` (and, if your version
  supports it, `ANTHROPIC_SMALL_FAST_MODEL` for the lightweight background
  model) to exact IDs from step 1:

  ```bash
  export ANTHROPIC_MODEL="paste_exact_model_id_here"
  export ANTHROPIC_SMALL_FAST_MODEL="paste_small_model_id_here"
  ```

- Environment-variable names and precedence can change between Claude Code
  releases. When something behaves unexpectedly, check the current
  [Claude Code settings docs](https://docs.anthropic.com/en/docs/claude-code/settings)
  and compare against the raw smoke test in step 2.

## 4. Persist it (optional)

To avoid re-exporting each session, add the variables to your shell profile
(`~/.zshrc`, `~/.bashrc`) or to a project-local `.env` that you keep out of git.

```bash
# ~/.zshrc
export ANTHROPIC_BASE_URL="https://daoxe.com"
export ANTHROPIC_AUTH_TOKEN="your_api_key"
export ANTHROPIC_MODEL="paste_exact_model_id_here"
```

Never commit the key or paste it into screenshots. If a key leaks, rotate it in
the dashboard.

## If curl works but Claude Code fails

Stop changing models and prompts. The protocol is proven by step 2, so the
problem is client configuration:

1. Confirm `ANTHROPIC_BASE_URL` is the host root, not `.../v1`.
2. Confirm the key is exported in the **same shell** that launches `claude`.
3. Try `ANTHROPIC_API_KEY` if `ANTHROPIC_AUTH_TOKEN` alone does not authenticate.
4. Confirm `ANTHROPIC_MODEL` (if set) is an exact ID from step 1, not a friendly
   Anthropic model alias.
5. Re-run the step 2 smoke test to rule out a key or balance issue.

## Related

- [CLIENT_SETUP.md](CLIENT_SETUP.md) — Cline, Roo Code, Continue, and the raw
  Messages / Chat Completions / Responses paths.
- [Postman collection](postman/DaoXE.postman_collection.json) — Anthropic
  Messages, Chat Completions, Responses, and image generations.
- [README](README.md) — examples and the low-cost benchmark CLI.

---

## 中文摘要

Claude Code CLI 走 Anthropic **Messages** 协议。DaoXE 在
`https://daoxe.com/v1/messages` 提供 Claude 协议，因此只需两个环境变量即可让
Claude Code 直连 DaoXE，无需代理或改代码：

```bash
export ANTHROPIC_BASE_URL="https://daoxe.com"   # 主机根，Claude Code 自动补 /v1/messages
export ANTHROPIC_AUTH_TOKEN="你的_API_KEY"       # 部分版本读 ANTHROPIC_API_KEY，可同时设置
```

先用第 2 步的 curl 冒烟测试确认 `/v1/messages` 通了，再配置 Claude Code。模型 ID
请从 `GET /v1/models` 的实时目录里取，别照抄博客。可选 `ANTHROPIC_MODEL` 固定模型。
DaoXE 是多模型多协议网关（不仅 OpenAI 协议、也不仅 OpenAI/Claude 模型），**不向中国大陆提供服务**。

## Кратко (RU)

Claude Code CLI использует протокол Anthropic **Messages**. DaoXE предоставляет
Claude-протокол по адресу `https://daoxe.com/v1/messages`, поэтому достаточно
двух переменных окружения — без прокси и правок кода:

```bash
export ANTHROPIC_BASE_URL="https://daoxe.com"   # корень хоста; путь /v1/messages добавит сам клиент
export ANTHROPIC_AUTH_TOKEN="ваш_API_KEY"        # в некоторых версиях читается ANTHROPIC_API_KEY
```

Сначала проверьте `/v1/messages` через curl из шага 2, затем настраивайте Claude
Code. ID модели берите из живого каталога `GET /v1/models`. DaoXE —
мультимодельный мультипротокольный шлюз; сервис недоступен в материковом Китае.
