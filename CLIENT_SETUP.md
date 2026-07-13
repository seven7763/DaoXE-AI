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

DaoXE is multi-model and multi-protocol. **Cline** connects through its generic
**OpenAI Compatible** provider (custom base URL). There is **no** separate
built-in **DaoXE** entry in Cline's API provider list—do not look for a
first-class DaoXE dropdown option.

1. Open Cline in VS Code and select the gear icon to open its settings.
2. Set **API Provider** to **OpenAI Compatible**.
3. Enter `https://daoxe.com/v1` in **Base URL**.
4. Enter the API key created in your DaoXE dashboard in **API Key**.
5. Enter an exact model ID currently available to your DaoXE account in
   **Model** / **Model ID** (copy from your account catalog or
   `GET /v1/models`; do not hardcode a list from a blog post).
6. Optionally adjust **Model Configuration** (for example max output tokens or
   context window) if your Cline build exposes those fields.

Notes:

- This path uses DaoXE's **OpenAI-compatible Chat Completions** endpoint. DaoXE
  also exposes OpenAI Responses and Anthropic Messages for other clients; those
  protocols are not required for the Cline OpenAI Compatible setup above.
- Prefer live model IDs from your account. A request may be billed.

> Upstream Cline docs PR
> https://github.com/cline/cline/pull/12244 was **closed** (maintainers found
> third-party gateway notes confusing next to first-party provider pages and
> prefer pointers from the gateway side). Use the steps above instead of waiting
> for a built-in DaoXE provider in Cline.

Official Cline field names and OpenAI Compatible flow:
[Cline OpenAI Compatible provider guide](https://github.com/cline/cline/blob/main/docs/provider-config/openai-compatible.mdx).

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

## DeepChat

DaoXE is available as a **built-in provider** in DeepChat (merged upstream):

1. Open DeepChat → Providers and select **DaoXE**.
2. Paste the API key created in your DaoXE account.
3. Pick an exact model ID currently available to your account (or refresh the model list from the provider).

If your DeepChat build is older than the merge, add DaoXE as a custom OpenAI-compatible endpoint with base URL `https://daoxe.com/v1` until you upgrade.

Upstream PR: https://github.com/ThinkInAIXYZ/deepchat/pull/1948

## Claude Code Router (CCR)

DaoXE has a multi-protocol provider preset PR for Claude Code Router (Anthropic Messages + OpenAI Chat Completions + OpenAI Responses). Until it merges, add DaoXE manually:

1. Create a provider with base URL **host root** `https://daoxe.com` (CCR appends `/v1` for OpenAI paths and uses root + `/v1/messages` for Anthropic).
2. Enable the protocols your workflow needs: `anthropic_messages`, `openai_chat_completions`, and/or `openai_responses`.
3. Use your DaoXE API key; do not hardcode model lists—pull live catalog IDs for your account.

Upstream PR (open): https://github.com/musistudio/claude-code-router/pull/1530

## OpenCode

DaoXE is multi-model and multi-protocol. OpenCode can use the **OpenAI-compatible** path (`@ai-sdk/openai-compatible`).

### A) models.dev listing (if present)

After https://github.com/anomalyco/models.dev/pull/3199, DaoXE may appear in OpenCode’s provider list from [models.dev](https://models.dev). Use your DaoXE API key and an exact account model ID.

### B) Custom provider config (always works)

1. Run `/connect` → **Other** → provider id `daoxe` → paste your DaoXE API key.
2. Put this in project `opencode.json` (replace the model key with an exact ID from your DaoXE account / `GET /v1/models`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "daoxe": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "DaoXE",
      "options": {
        "baseURL": "https://daoxe.com/v1"
      },
      "models": {
        "YOUR_DAOXE_MODEL_ID": {
          "name": "DaoXE model (replace with your account model ID)"
        }
      }
    }
  }
}
```

3. Run `/models` and select the DaoXE entry.

Upstream docs PR: https://github.com/anomalyco/opencode/pull/36649

DaoXE also exposes OpenAI Responses and Anthropic Messages for other clients; OpenCode’s path above is Chat Completions via the OpenAI-compatible package.

## Kilo Code

DaoXE is already present in the [models.dev](https://models.dev) catalog that
[Kilo Code](https://github.com/Kilo-Org/kilocode) refreshes. Kilo uses the
OpenAI-compatible path for this provider.

In the VS Code extension, open **Settings → Providers**, add **DaoXE**, enter
your API key, and select an exact model ID available to your account. If DaoXE
is not visible, open **Show more providers** and refresh the provider catalog.

For the Kilo CLI, export the key and configure the provider in `kilo.json`:

```bash
export DAOXE_API_KEY="your-api-key"
```

```jsonc
{
  "provider": {
    "daoxe": {
      "env": ["DAOXE_API_KEY"]
    }
  },
  "model": "daoxe/YOUR_DAOXE_MODEL_ID"
}
```

Replace `YOUR_DAOXE_MODEL_ID` with an exact model ID available to your account.
Kilo connects through `https://daoxe.com/v1`; DaoXE's Responses, Anthropic
Messages, and image endpoints remain available to clients that use those
protocols. DaoXE is not available in mainland China.

- Upstream documentation issue: https://github.com/Kilo-Org/kilocode/issues/12172
- Upstream documentation PR: https://github.com/Kilo-Org/kilocode/pull/12173

## Goose

DaoXE has a declarative OpenAI-compatible provider PR for [goose](https://github.com/aaif-goose/goose) (bundled JSON + registry). Until it merges, configure a custom OpenAI-compatible endpoint:

- **Base URL:** `https://daoxe.com/v1`
- **API key env:** `DAOXE_API_KEY`
- **Model IDs:** prefer live discovery from your DaoXE account (`GET /v1/models`)

Upstream PR (open): https://github.com/aaif-goose/goose/pull/10412

## AnythingLLM

DaoXE has a first-class LLM provider PR for [AnythingLLM](https://github.com/Mintplex-Labs/anything-llm) (settings + onboarding + live `/models`). Until it merges, use **Generic OpenAI**:

- **Base URL:** `https://daoxe.com/v1`
- **API Key:** your DaoXE key
- **Model:** exact ID from your account catalog

Upstream PR (open): https://github.com/Mintplex-Labs/anything-llm/pull/6003


## FastGPT

Add DaoXE as a **custom OpenAI channel** in FastGPT self-host model config (no built-in vendor page required):

- **Protocol:** OpenAI
- **Base URL:** `https://daoxe.com/v1`
- **API Key:** your DaoXE key
- **Model IDs:** exact IDs from your account catalog (`GET /v1/models`)

Optional: if your stack supports an Anthropic channel type, DaoXE also speaks `POST https://daoxe.com/v1/messages` (same key; account-scoped model IDs).

> Upstream docs PR https://github.com/labring/FastGPT/pull/7295 was **closed** (maintainers only accept first-party model-cloud vendor tutorials). Use the generic OpenAI channel steps above instead.


## Khoj

Self-hosted [Khoj](https://github.com/khoj-ai/khoj) can use DaoXE as an OpenAI-compatible API base (same pattern as LiteLLM / OpenRouter proxies):

1. Create a key in your [DaoXE dashboard](https://daoxe.com/dashboard).
2. In the Khoj admin panel, add an **API Model API**:
   - **Name:** `daoxe`
   - **Api Key:** your DaoXE key
   - **Api Base Url:** `https://daoxe.com/v1`
3. Add a **Chat Model** with **Model Type** `Openai`, point it at that API, and set **Name** to an exact model ID from your DaoXE account catalog (`GET /v1/models`).
4. Select that chat model in Khoj settings.

Notes: self-host only for custom providers; do not hardcode model lists; DaoXE is not available in mainland China.

- Upstream docs PR (open): https://github.com/khoj-ai/khoj/pull/1373
- Setup gist: https://gist.github.com/seven7763/b547f1f889872a73a5df7983d40b0636

## LLM CLI (simonw/llm)

DaoXE has a docs example PR for [LLM](https://github.com/simonw/llm) (`extra-openai-models.yaml`). Until it merges:

```bash
llm keys set daoxe
# paste key
```

```yaml
# in extra-openai-models.yaml
- model_id: daoxe
  model_name: YOUR_DAOXE_MODEL_ID
  api_base: "https://daoxe.com/v1"
  api_key_name: daoxe
  supports_tools: true
```

```bash
llm -m daoxe 'Reply with OK'
```

Upstream PR (open): https://github.com/simonw/llm/pull/1528

## CrewAI

DaoXE works with [CrewAI](https://github.com/crewAIInc/crewAI) as a custom OpenAI-compatible endpoint:

```python
from crewai import LLM
import os

llm = LLM(
    model="openai/YOUR_DAOXE_MODEL_ID",  # exact ID from your DaoXE account catalog
    custom_openai=True,
    base_url="https://daoxe.com/v1",
    api_key=os.getenv("DAOXE_API_KEY"),
)
```

Use that `llm` on agents/tasks as usual. Prefer live model IDs from `GET /v1/models`. Not available in mainland China.

Upstream docs PR (open): https://github.com/crewAIInc/crewAI/pull/6527

## browser-use

[browser-use](https://github.com/browser-use/browser-use) can call DaoXE through `ChatOpenAI` with an OpenAI-compatible base URL (same pattern as OpenRouter/Novita examples):

```python
import os
from browser_use import Agent, ChatOpenAI

agent = Agent(
    task="Your task",
    llm=ChatOpenAI(
        base_url="https://daoxe.com/v1",
        model=os.getenv("DAOXE_MODEL_ID", "YOUR_DAOXE_MODEL_ID"),
        api_key=os.getenv("DAOXE_API_KEY"),
    ),
    use_vision=False,
)
```

Upstream example PR (open): https://github.com/browser-use/browser-use/pull/5209

## LiteLLM

DaoXE has an OpenAI-compatible provider registration PR for [LiteLLM](https://github.com/BerriAI/litellm) (`openai_like/providers.json`) plus a docs page PR.

Until they merge, use either path:

**A. Native prefix (after code PR merges):**

```python
import os
from litellm import completion

os.environ["DAOXE_API_KEY"] = "<DAOXE_API_KEY>"
response = completion(
    model="daoxe/YOUR_DAOXE_MODEL_ID",
    messages=[{"role": "user", "content": "Reply with OK"}],
    max_tokens=8,
)
```

**B. Generic OpenAI-compatible (works today):**

```yaml
# litellm proxy config
model_list:
  - model_name: daoxe
    litellm_params:
      model: openai/YOUR_DAOXE_MODEL_ID
      api_base: https://daoxe.com/v1
      api_key: os.environ/DAOXE_API_KEY
```

Model IDs are account-scoped (`GET /v1/models`). Not available in mainland China.

- Code PR: https://github.com/BerriAI/litellm/pull/33051
- Docs PR: https://github.com/BerriAI/litellm-docs/pull/550
- Config gist: https://gist.github.com/seven7763/06f1454705acaba2919a9be0a96565c4

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
- **Claude Code CLI:** for the native `ANTHROPIC_BASE_URL` / `ANTHROPIC_AUTH_TOKEN`
  setup (no proxy or router), see [CLAUDE_CODE.md](CLAUDE_CODE.md).
- Related discussion: [CC Switch DaoXE universal preset](https://github.com/farion1231/cc-switch/issues/5258).
- Claude Code Router preset PR: https://github.com/musistudio/claude-code-router/pull/1530
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
内置 Provider（DeepChat 内置与 models.dev / OpenCode 路径见上文）。

## Кратко по-русски (CIS / релоканты)

Выберите в клиенте универсальный режим **OpenAI Compatible** и укажите
`https://daoxe.com/v1` как Base URL. Для протокола **Claude / Anthropic Messages**
используйте `https://daoxe.com/v1/messages` (для Claude Code — корень хоста
`https://daoxe.com`, см. [CLAUDE_CODE.md](CLAUDE_CODE.md)). Создайте API-ключ в
своём аккаунте DaoXE и скопируйте точный ID модели из актуального списка
аккаунта (`GET /v1/models`). Русскоязычный канал: [@daoxe_api_ru](https://t.me/daoxe_api_ru)
— для разработчиков в CIS и на релокации (языковой канал, не geo-target «только РФ»).
Эта инструкция не означает, что DaoXE встроен во все клиенты (DeepChat и
models.dev/OpenCode — см. разделы выше).

## Tóm tắt tiếng Việt / Vietnam note (Vietnamese-first for local channels)

Chọn **OpenAI Compatible**, Base URL `https://daoxe.com/v1`, API key từ dashboard
DaoXE, model ID **chính xác** từ tài khoản (`GET /v1/models`) — không hardcode
danh sách blog. Claude Code: `ANTHROPIC_BASE_URL=https://daoxe.com` (host root)
+ `ANTHROPIC_AUTH_TOKEN`. DaoXE is multi-model multi-protocol; **not available in
mainland China**.

- Full Vietnamese Viblo post: https://viblo.asia/p/gan-cline-continue-claude-code-vao-mot-multi-protocol-gateway-khi-the-quoc-te-hay-fail-R5JRQpzz4Gv
- Billing-friction checklist (DEV, EN): https://dev.to/seven7763/testing-an-ai-api-from-a-country-where-the-official-card-checkout-keeps-failing-3ob8


## Microsoft Semantic Kernel (Python)

Use the OpenAI connector with a custom `AsyncOpenAI` client (same pattern as the Ollama/LM Studio samples):

```python
import os
from openai import AsyncOpenAI
from semantic_kernel import Kernel
from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion

kernel = Kernel()
client = AsyncOpenAI(
    api_key=os.environ["DAOXE_API_KEY"],
    base_url="https://daoxe.com/v1",
)
kernel.add_service(
    OpenAIChatCompletion(
        service_id="daoxe",
        ai_model_id=os.environ["DAOXE_MODEL"],  # exact account model ID
        async_client=client,
    )
)
```

Upstream sample PR (if open): search `samples/add-daoxe-openai-compatible` on semantic-kernel forks.





## Langfuse (OpenAI drop-in)

Point Langfuse OpenAI instrumentation / SDK base URL at DaoXE:

- Base URL: `https://daoxe.com/v1`
- API key: DaoXE dashboard key
- Model: exact ID from your account catalog (`GET /v1/models`)

DaoXE is multi-model multi-protocol; Langfuse OpenAI path uses Chat Completions-compatible traffic.
Upstream docs PR (if open): search DaoXE under langfuse-docs integrations/gateways.
Not available in mainland China.


## GPT Researcher

GPT Researcher can use any OpenAI-compatible Chat Completions endpoint via env:

```bash
export OPENAI_API_KEY="your_daoxe_key"
export OPENAI_BASE_URL="https://daoxe.com/v1"
export OPENAI_MODEL_NAME="exact_account_model_id"  # from GET /v1/models
```

DaoXE is multi-model multi-protocol; this client path uses Chat Completions only.
Upstream docs PR (if open): search `docs/daoxe-openai-compatible-gateway` on gpt-researcher forks.
Not available in mainland China. Prefer live model IDs from your account.


## Viblo (Vietnam tutorial)

**Preferred for VN readers:** full Vietnamese Viblo post:

https://viblo.asia/p/gan-cline-continue-claude-code-vao-mot-multi-protocol-gateway-khi-the-quoc-te-hay-fail-R5JRQpzz4Gv

Draft gist: https://gist.github.com/seven7763/4256a404bbe8b00407ce6f5973198218

English posts already live (direct links; may be spam-filtered from homepage):

- Client setup: https://viblo.asia/p/wire-cline-continue-claude-code-to-one-multi-protocol-gateway-when-card-checkout-fails-PoL7emEk4vk
- Claude Code 404 (VI): https://viblo.asia/p/claude-code-404-tren-multi-protocol-gateway-host-root-vs-v1-XRJ8Rg19VGq
- Claude Code host-root vs `/v1` (404, EN): https://viblo.asia/p/claude-code-404-on-third-party-gateways-host-root-vs-v1-y0VGwXe0VPA

CIS/VN operator paste packs: https://gist.github.com/seven7763/8f294b086a5d0e6f981c852d62b8c587

## Microsoft AutoGen (AgentChat)

Use the OpenAI-compatible model client with DaoXE:

```python
import os
from autogen_ext.models.openai import OpenAIChatCompletionClient

client = OpenAIChatCompletionClient(
    model="YOUR_DAOXE_MODEL_ID",  # exact ID from your DaoXE account
    api_key=os.environ["DAOXE_API_KEY"],
    base_url="https://daoxe.com/v1",
    model_info={
        "vision": False,
        "function_calling": True,
        "json_output": True,
        "family": "unknown",
        "structured_output": True,
    },
)
```

Upstream docs PR: https://github.com/microsoft/autogen/pull/7952

## big-AGI

Add an OpenAI-compatible host pointing at DaoXE:

1. Models settings → add OpenAI-compatible / custom host.
2. Host: `https://daoxe.com` (app may append `/v1`).
3. API key from the DaoXE dashboard; load models from your account catalog.

Upstream PR: https://github.com/enricoros/big-AGI/pull/1160



## Hugging Face smolagents

```python
import os
from smolagents import OpenAIModel

model = OpenAIModel(
    model_id=os.environ["DAOXE_MODEL"],
    api_base="https://daoxe.com/v1",
    api_key=os.environ["DAOXE_API_KEY"],
)
```

Upstream: https://github.com/huggingface/smolagents/pull/2514


## Instructor

```python
import os
from openai import OpenAI
import instructor
from pydantic import BaseModel

class User(BaseModel):
    name: str
    age: int

client = instructor.from_openai(
    OpenAI(api_key=os.environ["DAOXE_API_KEY"], base_url="https://daoxe.com/v1")
)
user = client.chat.completions.create(
    model=os.environ["DAOXE_MODEL"],
    messages=[{"role": "user", "content": "Ivan is 28"}],
    response_model=User,
)
```

Upstream: https://github.com/567-labs/instructor/pull/2436

## Outlines

```python
import os
import openai
import outlines

client = openai.OpenAI(
    base_url="https://daoxe.com/v1",
    api_key=os.environ["DAOXE_API_KEY"],
)
model = outlines.from_openai(client, os.environ["DAOXE_MODEL"])
```

Upstream: https://github.com/dottxt-ai/outlines/pull/1920

## Agno

```python
import os
from agno.agent import Agent
from agno.models.openai import OpenAIChat

agent = Agent(
    model=OpenAIChat(
        id=os.environ["DAOXE_MODEL"],
        api_key=os.environ["DAOXE_API_KEY"],
        base_url="https://daoxe.com/v1",
    ),
    markdown=True,
)
```

## LlamaIndex

```python
import os
from llama_index.llms.openai_like import OpenAILike

llm = OpenAILike(
    model=os.environ["DAOXE_MODEL"],
    api_base="https://daoxe.com/v1",
    api_key=os.environ["DAOXE_API_KEY"],
    is_chat_model=True,
    is_function_calling_model=True,
)
```

## DSPy

```python
import os
import dspy

lm = dspy.LM(
    f"openai/{os.environ['DAOXE_MODEL']}",
    api_key=os.environ["DAOXE_API_KEY"],
    api_base="https://daoxe.com/v1",
    model_type="chat",
)
dspy.configure(lm=lm)
```

Upstream: https://github.com/stanfordnlp/dspy/pull/10008

## Haystack

```python
from haystack.utils import Secret
from haystack.components.generators.chat import OpenAIChatGenerator

generator = OpenAIChatGenerator(
    api_key=Secret.from_env_var("DAOXE_API_KEY"),
    api_base_url="https://daoxe.com/v1",
    model="YOUR_DAOXE_MODEL_ID",
)
```

Upstream: https://github.com/deepset-ai/haystack/pull/11989

## Mem0

```python
import os
from mem0 import Memory

os.environ["OPENAI_API_KEY"] = os.environ["DAOXE_API_KEY"]
config = {
    "llm": {
        "provider": "openai",
        "config": {
            "model": "YOUR_DAOXE_MODEL_ID",
            "openai_base_url": "https://daoxe.com/v1",
        },
    }
}
m = Memory.from_config(config)
```

















## STORM (stanford-oval)

Run STORM with LiteLLM-style OpenAI-compatible base:

- `api_base` / base URL: `https://daoxe.com/v1`
- API key + account-scoped model IDs

Upstream example PR (if open): https://github.com/stanford-oval/storm/pull/484  
Not available in mainland China.


## Open Interpreter

Configure a custom OpenAI-compatible / multi-protocol provider toward DaoXE:

- Base: `https://daoxe.com/v1` (Chat Completions path)
- Anthropic Messages where the client supports `wire_api=messages` / host-root patterns — see upstream docs
- Model IDs from your account catalog only

Upstream docs PR (if open): https://github.com/openinterpreter/openinterpreter/pull/1796  
Not available in mainland China.


## ElizaOS

Set OpenAI-compatible env for Eliza model providers:

```bash
export OPENAI_API_KEY="your_daoxe_key"
export OPENAI_BASE_URL="https://daoxe.com/v1"
# model id from GET /v1/models (account-scoped)
```

Upstream docs PR (if open): https://github.com/elizaOS/eliza/pull/16283  
Multi-protocol gateway; not available in mainland China.


## Strands Agents (community OpenAI-compatible)

Use Strands `OpenAIModel` (or equivalent OpenAI-compatible provider) with:

- Base URL: `https://daoxe.com/v1`
- API key: DaoXE dashboard
- Model: exact account catalog ID

Upstream docs PR (if open): https://github.com/strands-agents/harness-sdk/pull/3218  
Multi-protocol gateway; not available in mainland China.


## Opik (Comet)

Configure Opik / OpenAI-compatible tracing against DaoXE:

- Base URL: `https://daoxe.com/v1`
- API key: DaoXE dashboard
- Model IDs: from your account `GET /v1/models`

Upstream docs PR (if open): https://github.com/comet-ml/opik/pull/7459  
Multi-model multi-protocol gateway; mainland China unavailable.


## OpenAI Agents SDK (Python)

Use `OpenAIChatCompletionsModel` with a custom base URL:

```python
# base_url="https://daoxe.com/v1"
# api_key from DaoXE dashboard
# model: exact ID from GET /v1/models
```

Upstream docs PR (if open): https://github.com/openai/openai-agents-python/pull/3826  
DaoXE multi-model multi-protocol; this path is Chat Completions. Not available in mainland China.


## Graphiti

Use Graphiti's OpenAI-compatible client with DaoXE:

- `base_url=https://daoxe.com/v1`
- API key + exact model IDs from your account catalog

Upstream PR (if open): https://github.com/getzep/graphiti/pull/1649  
Not available in mainland China.


## Stagehand (Browserbase)

Use Stagehand with an OpenAI-compatible model endpoint:

- Base URL / API base: `https://daoxe.com/v1`
- API key: DaoXE dashboard key
- Model: exact account catalog ID (`GET /v1/models`)

Upstream PR (if open): https://github.com/browserbase/stagehand/pull/2350  
Not available in mainland China.

