# One base URL, two protocols: wiring Cline and Claude Code to a multi-protocol LLM gateway

*Practical setup notes for developers who already use OpenAI-compatible clients and also need Anthropic Messages.*

---

If you run coding agents, you have probably hit at least one of these:

- Cline works with a custom `base_url`, but Claude Code fails with a 404 on `/v1/messages`
- Claude Code works, but Continue returns empty model lists
- Copy-pasted model IDs from a blog 404 on *your* account

The root cause is often not “the gateway is broken.” It is usually **protocol shape** and **which base URL the client expects**.

This post is a short checklist. Examples use a multi-protocol gateway ([DaoXE](https://daoxe.com/?utm_source=devto&utm_medium=article&utm_campaign=multi_protocol_setup)) that exposes:

- OpenAI Chat Completions at `https://daoxe.com/v1`
- Anthropic Messages at `https://daoxe.com/v1/messages`

The same ideas apply to any multi-protocol gateway. DaoXE is **not** a built-in provider inside Cline or Claude Code; you configure the generic OpenAI-compatible / Anthropic env path.

> **Billing:** every smoke request may be billed. Keep `max_tokens` tiny.

---

## 1. Decide which protocol your client speaks

| Client | Typical path | What you set |
| --- | --- | --- |
| Cline / Roo Code / many OpenAI SDK apps | Chat Completions | Base URL **including** `/v1` |
| Continue (`config.yaml`) | Chat Completions | `apiBase` with `/v1` |
| Claude Code | Anthropic Messages | Host **root** only; client appends `/v1/messages` |
| Raw `curl` OpenAI style | `/v1/chat/completions` | Full path |
| Raw `curl` Claude style | `/v1/messages` | Full path + Anthropic headers |

Rule of thumb:

- **OpenAI-compatible UI field “Base URL”** → almost always `https://HOST/v1`
- **Claude Code `ANTHROPIC_BASE_URL`** → almost always `https://HOST` (no `/v1`)

Getting this wrong is the #1 source of double-path bugs (`/v1/v1/...`) or missing `/v1`.

---

## 2. Smoke-test the raw protocol before touching the IDE

### OpenAI-compatible Chat Completions

```bash
export API_KEY="your_key"
export MODEL="exact_model_id_from_your_account"

curl --fail-with-body -sS \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"$MODEL\",\"max_tokens\":8,\"messages\":[{\"role\":\"user\",\"content\":\"Reply with OK\"}]}" \
  "https://daoxe.com/v1/chat/completions"
```

Expect HTTP 200.

### Anthropic Messages (Claude protocol)

```bash
curl --fail-with-body -sS \
  -H "x-api-key: $API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"$MODEL\",\"max_tokens\":8,\"messages\":[{\"role\":\"user\",\"content\":\"Reply with OK\"}]}" \
  "https://daoxe.com/v1/messages"
```

If raw `curl` fails, fix auth / model / path **before** debugging Cline or Claude Code.

List models (account-scoped; do not hardcode blog IDs):

```bash
curl -sS -H "Authorization: Bearer $API_KEY" "https://daoxe.com/v1/models"
```

---

## 3. Cline (OpenAI Compatible)

1. Gear → **API Provider** → **OpenAI Compatible**
2. **Base URL:** `https://daoxe.com/v1`
3. **API Key:** from your dashboard
4. **Model ID:** exact ID from `GET /v1/models` for *your* account

Notes:

- There is no first-class “DaoXE” dropdown in Cline; use generic OpenAI Compatible.
- This path uses Chat Completions. Anthropic Messages is for other clients.

Upstream field names: [Cline OpenAI Compatible docs](https://docs.cline.bot/provider-config/openai-compatible).

---

## 4. Claude Code (Anthropic Messages)

Claude Code builds `/v1/messages` itself:

```bash
export ANTHROPIC_BASE_URL="https://daoxe.com"
export ANTHROPIC_AUTH_TOKEN="your_api_key"
# some versions:
export ANTHROPIC_API_KEY="your_api_key"

export ANTHROPIC_MODEL="exact_model_id_from_your_account"
claude
```

**Do not** set `ANTHROPIC_BASE_URL=https://daoxe.com/v1` unless you have verified your Claude Code version does not double-append `/v1`.

---

## 5. Base URL shape checklist (save this)

Before you open an issue on the client or the gateway:

1. [ ] Protocol matches the client (Chat Completions vs Messages)
2. [ ] OpenAI-compatible base includes `/v1`; Claude Code base is host root
3. [ ] No trailing slash surprises (`/v1` vs `/v1/`) for your client version
4. [ ] Model ID is live **for this API key**, not copied from a random post
5. [ ] Raw `curl` smoke works before IDE config
6. [ ] Env vars are exported in the same shell that launches the CLI
7. [ ] You are not in a region the service does not serve (check terms)

---

## 6. When multi-protocol actually matters

Use **Chat Completions** when:

- The client only has “OpenAI Compatible”
- You want the broadest SDK support

Use **Anthropic Messages** when:

- The client is Claude Code or another Anthropic-native tool
- You need Claude-style headers / message format end-to-end

A multi-protocol gateway is useful when **one account** must feed **both** kinds of clients without running two proxies.

---

## 7. Minimal reproducible debug template

When something fails, collect:

```text
Client name + version:
Protocol intended:
Base URL configured:
Path that failed (from logs):
HTTP status:
Whether raw curl to the same path succeeds (yes/no):
Whether model ID was listed by GET /v1/models for this key (yes/no):
```

That alone usually separates “client config” from “upstream/gateway.”

---

## References

- Example repo with smoke scripts and client notes:  
  https://github.com/seven7763/DaoXE-AI  
  - [CLIENT_SETUP.md](https://github.com/seven7763/DaoXE-AI/blob/main/CLIENT_SETUP.md)  
  - [CLAUDE_CODE.md](https://github.com/seven7763/DaoXE-AI/blob/main/CLAUDE_CODE.md)
- Service: https://daoxe.com  

*Disclosure: DaoXE is our multi-protocol API gateway. The checklist above applies to multi-protocol gateways in general; use any provider that matches your protocols.*

---

**Suggested tags (DEV.to):** `#ai` `#llm` `#openai` `#claude` `#devtools` `#api`
