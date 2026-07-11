# DaoXE API 示例与低成本连通性测试

[English](README.md) | **简体中文** | [Русский](README.md#russian)

[![CI](https://github.com/seven7763/DaoXE-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/seven7763/DaoXE-AI/actions/workflows/ci.yml)

这个仓库为中文开发者与海外华语用户提供一组小而透明、可以直接审查的
[DaoXE](https://daoxe.com/?utm_source=github&utm_medium=organic&utm_campaign=cn_launch) API 示例，以及一个控制请求数量的连通性测试工具。
DaoXE 的 OpenAI 兼容 base URL 是：

```text
https://daoxe.com/v1
```

> **服务地区提示：** DaoXE 官网当前明确标注“不向中国大陆提供服务（Not
> available in mainland China）”。中文文档不代表服务可在中国大陆使用。请仅在
> 服务条款允许的地区注册和调用，并遵守所在地适用的法律与平台规则。

仓库不写死模型名单、免费额度或价格。请在自己的 DaoXE 控制台查看当前可用的
准确模型 ID、账户余额和最新价格。

## 这个仓库能做什么

- 用 `smoke` 向一个模型发送一次小请求，确认当前是否能够调用。
- 用 `compare` 顺序测试 2～3 个模型，比较本次请求的状态、延迟和 token 用量。
- 通过 cURL、Node.js 或 Python 运行 OpenAI Chat Completions 示例。
- 导入 Postman 模板，测试模型列表、Chat Completions、Responses 和 Anthropic
  Messages 请求。
- 在完全不连接 DaoXE、不消耗账户余额的情况下运行本地 mock 测试。

> **费用提醒：** `smoke` 会发送 1 次真实生成请求；`compare` 会对每个模型各发送
> 1 次真实生成请求。这些请求可能产生费用。工具默认把每次最大输出限制为 8 个
> token，但运行前仍应检查当前价格和账户余额。

## 一分钟完成首次测试

### 1. 准备环境

你需要：

- Node.js 18 或更高版本；
- 一个 DaoXE 账户和在控制台创建的 API key；
- 当前账户可用的准确模型 ID。

克隆仓库：

```bash
git clone https://github.com/seven7763/DaoXE-AI.git
cd DaoXE-AI
```

连通性测试只使用 Node.js 内置 API，因此运行 `smoke` 或 `compare` 前不需要安装
第三方依赖。

### 2. 获取准确的模型 ID

可以从 DaoXE 控制台复制模型 ID，也可以调用仓库已使用的 Models 端点：

```bash
export DAOXE_API_KEY="your_api_key"

curl --fail-with-body --show-error --silent \
  https://daoxe.com/v1/models \
  -H "Authorization: Bearer ${DAOXE_API_KEY}"
```

从返回结果中选择当前账户可用的准确模型 ID，不要根据旧文章猜测模型名称。

### 3. 发送一次小请求

```bash
export DAOXE_MODEL="your_exact_model_id"
npm run smoke
```

成功时，报告会显示 `ok`、HTTP `200`、本次延迟，以及上游返回时可用的 token
统计。为降低敏感信息泄漏风险，工具不会显示模型回复文本。

也可以把模型 ID 放在命令后面：

```bash
DAOXE_API_KEY="your_api_key" npm run smoke -- "your_exact_model_id"
```

API key 只能通过 `DAOXE_API_KEY` 环境变量传入，工具不接受把 key 放在命令参数中。

## 接入现有 OpenAI SDK 项目

如果现有 Node.js 项目已经使用 OpenAI SDK，核心配置是使用 DaoXE 的 API key，
并把 `baseURL` 指向 `https://daoxe.com/v1`：

```js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DAOXE_API_KEY,
  baseURL: "https://daoxe.com/v1",
});

const response = await client.chat.completions.create({
  model: process.env.DAOXE_MODEL,
  max_tokens: 64,
  messages: [{ role: "user", content: "请用一句话说明 API 已连通。" }],
});

console.log(response.choices[0].message.content);
```

完整的可运行版本见 [`node_chat.mjs`](node_chat.mjs)。Python SDK 示例见
[`python_chat.py`](python_chat.py)。两个示例都会打印模型回复，行为与 benchmark
工具不同。

## 仓库中已有的请求模板

| 用途 | 方法与地址 | 仓库入口 |
| --- | --- | --- |
| 获取当前账户可用模型 | `GET https://daoxe.com/v1/models` | Postman |
| OpenAI Chat Completions | `POST https://daoxe.com/v1/chat/completions` | cURL、Node.js、Python、Postman |
| OpenAI Responses | `POST https://daoxe.com/v1/responses` | Postman |
| Anthropic Messages | `POST https://daoxe.com/v1/messages` | Postman |

实际可用模型和能力取决于当前账户与服务端配置。建议先查询 `/v1/models`，再使用
返回的准确 ID 发起小请求。

## 比较 2～3 个模型

`compare` 会顺序发送请求，并且最多接受 3 个不重复的模型 ID，以减少误操作造成
的请求数量：

```bash
export DAOXE_API_KEY="your_api_key"
npm run compare -- "model-id-1" "model-id-2" "model-id-3"
```

可以生成经过清理的 Markdown 或 JSON 报告：

```bash
npm run compare -- "model-id-1" "model-id-2" \
  --format markdown --output benchmark-report.md

npm run smoke -- "model-id-1" \
  --format json --output benchmark-report.json
```

可用选项：

```text
--max-tokens N    每次请求的最大输出 token，范围 1～64，默认 8
--timeout-ms N    单次请求超时，最大 120000 毫秒，默认 30000
--format FORMAT   table、json 或 markdown
--output FILE     把清理后的报告写入文件
```

写入的报告文件会设置为仅文件所有者可读写。报告只包含：

- 模型 ID；
- HTTP 状态；
- 本次请求延迟；
- 上游返回时可用的输入、输出和总 token 数；
- `http_error`、`timeout`、`network_error` 等粗粒度错误类别。

报告不会保存 API key、固定测试提示词、模型回复文本或 HTTP 错误响应正文。一次短
请求只能说明测试当时的情况，不能代表模型整体质量或服务长期稳定性。

## 其他可运行示例

先设置公共环境变量：

```bash
export DAOXE_API_KEY="your_api_key"
export DAOXE_MODEL="your_exact_model_id"
```

### cURL

```bash
./curl-chat.sh
```

### Node.js

```bash
npm install
npm run chat
```

### Python

```bash
python -m pip install -r requirements.txt
python python_chat.py
```

这三个示例都是实时生成请求，可能产生费用，并且会打印模型回复。

## Postman 使用方法

需要导入两个文件：

- [`postman/DaoXE.postman_collection.json`](postman/DaoXE.postman_collection.json)
- [`postman/DaoXE.example.postman_environment.json`](postman/DaoXE.example.postman_environment.json)

在 Postman 中：

1. 通过 **Import** 导入两个文件。
2. 选择 `DaoXE API - Example (set local values)` 环境。
3. 把控制台创建的 key 填入 `DAOXE_API_KEY` 的本地值；该变量已标记为 secret，
   仓库中的默认值为空。
4. 先发送 **List models**，再把返回的准确模型 ID 填入 `DAOXE_MODEL`。
5. 选择一个生成请求发送。模板把最大输出限制为 8 个 token。

不要在填入真实 key 后导出或提交 Postman 环境文件。模板中的生成请求可能产生
费用。

## 常见问题

### 为什么只看到 `http_error`，没有服务端错误正文？

benchmark 有意不复制错误响应正文，避免反射内容、提示词或其他敏感信息进入报告。
请根据 HTTP 状态检查 API key、模型 ID、账户状态和 DaoXE 当前文档；如果需要查看
完整响应，可在确认输出环境安全后使用 cURL 或 SDK 示例排查。

### 为什么显示 `timeout`？

默认单次超时是 30 秒。可以在确认愿意等待更久后调整，最大为 120 秒：

```bash
npm run smoke -- "your_exact_model_id" --timeout-ms 60000
```

### 可以把 `.env.example` 复制成 `.env` 吗？

仓库提供 `.env.example` 作为变量名称参考，但现有脚本不会自动加载 `.env`。请由
shell、部署平台或你自己的密钥管理工具注入环境变量，并确保真实 key 不被提交。

## 本地测试（不会调用 API）

```bash
npm test
```

测试使用进程内 mock，不需要 `DAOXE_API_KEY`，不会连接 DaoXE，也不会消耗余额。
CI 还会对 JavaScript、Bash 和 Python 示例做基础语法检查。

如需在本地执行与 CI 对应的静态检查：

```bash
node --check benchmark.mjs
node --check node_chat.mjs
bash -n curl-chat.sh
python -m py_compile python_chat.py
```

## 项目结构

```text
benchmark.mjs                         单模型测试与 2～3 模型比较工具
curl-chat.sh                          cURL Chat Completions 示例
node_chat.mjs                         Node.js OpenAI SDK 示例
python_chat.py                        Python OpenAI SDK 示例
postman/DaoXE.postman_collection.json Postman 请求集合
test/                                 不访问外网的本地测试
```

## 使用边界

- 运行任何真实生成请求前，先确认当前价格和余额。
- 只使用 `/v1/models` 或控制台中当前可见的准确模型 ID。
- 不要把真实 API key 写入源码、命令参数、日志、报告或 Git 历史。
- benchmark 适合做最小连通性检查和同一时点的基础延迟对比，不是完整性能评测。
