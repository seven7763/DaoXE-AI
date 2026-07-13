# DaoXE API 範例與低成本連線測試

[English](README.md) | [简体中文](README.zh-CN.md) | **繁體中文** | [Русский](README.md#russian)

> [!IMPORTANT]
> **服務區域說明：DaoXE 不向中國大陸提供服務（Not available in mainland
> China）。**
>
> 繁體中文文件不代表服務可在中國大陸使用。請只在服務條款允許的地區註冊及呼叫
> API，並遵守所在地適用的法律與平台規範。

[![CI](https://github.com/seven7763/DaoXE-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/seven7763/DaoXE-AI/actions/workflows/ci.yml)

這個儲存庫為使用繁體中文的開發者提供一組小巧、透明且可直接檢視的
[DaoXE](https://daoxe.com/?utm_source=github&utm_medium=organic&utm_campaign=zh_tw_launch)
API 範例，以及一個能控制請求數量的連線測試工具。
本文件面向臺灣、香港、澳門等地區的繁體中文讀者；服務是否可用，仍以 DaoXE
最新服務條款為準。DaoXE 的 OpenAI 相容 base URL 為：

```text
https://daoxe.com/v1
```

本儲存庫不寫死模型清單、免費額度或價格。請在自己的 DaoXE 控制台查看目前可用的
正確模型 ID、帳戶餘額與最新價格。

## 這個儲存庫能做什麼

- 使用 `smoke` 向一個模型傳送一次小型請求，確認目前是否能正常呼叫。
- 使用 `compare` 依序測試 2～3 個模型，比較本次請求的狀態、延遲與 token 用量。
- 透過 cURL、Node.js 或 Python 執行 OpenAI Chat Completions 範例。
- 匯入 Postman 範本，測試模型清單、Chat Completions、Responses、Anthropic
  Messages，以及可用的 image generation 介面 請求。
- 在完全不連線至 DaoXE、不消耗帳戶餘額的情況下執行本機 mock 測試。

> **費用提醒：** `smoke` 會傳送 1 次真實生成請求；`compare` 會向每個模型各傳送
> 1 次真實生成請求。這些請求可能產生費用。工具預設將每次最大輸出限制為 8 個
> token，但執行前仍應檢查目前價格與帳戶餘額。

## 一分鐘完成第一次測試

### 1. 準備環境

你需要：

- Node.js 18 或更新版本；
- 一個 DaoXE 帳戶，以及在控制台建立的 API key；
- 目前帳戶可用的正確模型 ID。

複製儲存庫：

```bash
git clone https://github.com/seven7763/DaoXE-AI.git
cd DaoXE-AI
```

連線測試只使用 Node.js 內建 API，因此執行 `smoke` 或 `compare` 前不需要安裝
第三方相依套件。

### 2. 取得正確的模型 ID

你可以從 DaoXE 控制台複製模型 ID，也可以呼叫本儲存庫所使用的 Models 端點：

```bash
export DAOXE_API_KEY="your_api_key"

curl --fail-with-body --show-error --silent \
  https://daoxe.com/v1/models \
  -H "Authorization: Bearer ${DAOXE_API_KEY}"
```

請從回傳結果中選擇目前帳戶可用的正確模型 ID，不要依照舊文章猜測模型名稱。

### 3. 傳送一次小型請求

```bash
export DAOXE_MODEL="your_exact_model_id"
npm run smoke
```

成功時，報告會顯示 `ok`、HTTP `200`、本次延遲，以及上游有回傳時可用的 token
統計資料。為降低敏感資訊外洩風險，工具不會顯示模型的回覆內容。

也可以將模型 ID 放在指令後方：

```bash
DAOXE_API_KEY="your_api_key" npm run smoke -- "your_exact_model_id"
```

API key 只能透過 `DAOXE_API_KEY` 環境變數傳入；工具不接受將 key 放在指令參數中。

## 串接現有 OpenAI SDK 專案

如果現有 Node.js 專案已經使用 OpenAI SDK，核心設定是使用 DaoXE 的 API key，
並將 `baseURL` 指向 `https://daoxe.com/v1`：

```js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DAOXE_API_KEY,
  baseURL: "https://daoxe.com/v1",
});

const response = await client.chat.completions.create({
  model: process.env.DAOXE_MODEL,
  max_tokens: 64,
  messages: [{ role: "user", content: "請用一句話說明 API 已連線。" }],
});

console.log(response.choices[0].message.content);
```

完整的可執行版本請參閱 [`node_chat.mjs`](node_chat.mjs)。Python SDK 範例請參閱
[`python_chat.py`](python_chat.py)。這兩個範例都會印出模型回覆，行為與 benchmark
工具不同。

## 儲存庫內已有的請求範本

| 用途 | 方法與網址 | 儲存庫入口 |
| --- | --- | --- |
| 取得目前帳戶可用的模型 | `GET https://daoxe.com/v1/models` | Postman |
| OpenAI Chat Completions | `POST https://daoxe.com/v1/chat/completions` | cURL、Node.js、Python、Postman |
| OpenAI Responses | `POST https://daoxe.com/v1/responses` | Postman |
| Anthropic Messages | `POST https://daoxe.com/v1/messages` | Postman |
| OpenAI Image Generations | `POST https://daoxe.com/v1/images/generations` | Postman |

實際可用的模型與功能取決於目前帳戶及伺服器端設定。建議先查詢 `/v1/models`，再用
回傳的正確 ID 傳送小型請求。

## 比較 2～3 個模型

`compare` 會依序傳送請求，且最多接受 3 個不重複的模型 ID，以減少誤操作造成的
請求數量：

```bash
export DAOXE_API_KEY="your_api_key"
npm run compare -- "model-id-1" "model-id-2" "model-id-3"
```

你可以產生經過清理的 Markdown 或 JSON 報告：

```bash
npm run compare -- "model-id-1" "model-id-2" \
  --format markdown --output benchmark-report.md

npm run smoke -- "model-id-1" \
  --format json --output benchmark-report.json
```

可用選項：

```text
--max-tokens N    每次請求的最大輸出 token，範圍 1～64，預設為 8
--timeout-ms N    單次請求逾時上限，最大 120000 毫秒，預設為 30000
--format FORMAT   table、json 或 markdown
--output FILE     將清理後的報告寫入檔案
```

寫入的報告檔案會設定為僅限檔案擁有者讀寫。報告只包含：

- 模型 ID；
- HTTP 狀態；
- 本次請求延遲；
- 上游有回傳時可用的輸入、輸出與總 token 數；
- `http_error`、`timeout`、`network_error` 等概略錯誤類別。

報告不會儲存 API key、固定測試提示詞、模型回覆內容或 HTTP 錯誤回應內容。一次短
請求只能說明測試當下的情況，不能代表模型整體品質或服務的長期穩定性。

## 其他可執行範例

請先設定共用環境變數：

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

這三個範例都會傳送即時生成請求，可能產生費用，且會印出模型回覆。

## Postman 使用方式

需要匯入兩個檔案：

- [`postman/DaoXE.postman_collection.json`](postman/DaoXE.postman_collection.json)
- [`postman/DaoXE.example.postman_environment.json`](postman/DaoXE.example.postman_environment.json)

在 Postman 中：

1. 透過 **Import** 匯入兩個檔案。
2. 選擇 `DaoXE API - Example (set local values)` 環境。
3. 將控制台建立的 key 填入 `DAOXE_API_KEY` 的本機值；此變數已標記為 secret，
   儲存庫中的預設值為空白。
4. 先傳送 **List models**，再將回傳的正確文字模型 ID 填入 `DAOXE_MODEL`。
5. 若要測試圖片介面，請將帳戶目前可用的圖片模型 ID 填入 `DAOXE_IMAGE_MODEL`。
6. 選擇一個生成請求並傳送（Chat Completions / Messages / Responses / Image）。
   文字生成範本將最大輸出限制為 8 個 token。

填入真實 key 後，請勿匯出或提交 Postman 環境檔案。範本中的生成請求可能產生
費用。

## 常見問題

### 為什麼只看到 `http_error`，沒有伺服器端錯誤回應內容？

benchmark 刻意不複製錯誤回應內容，以免反射內容、提示詞或其他敏感資訊進入報告。
請依照 HTTP 狀態檢查 API key、模型 ID、帳戶狀態與 DaoXE 目前的文件；如需查看
完整回應，請先確認輸出環境安全，再使用 cURL 或 SDK 範例進行疑難排解。

### 為什麼顯示 `timeout`？

預設的單次逾時上限為 30 秒。確認願意等待更長時間後，可調整至最多 120 秒：

```bash
npm run smoke -- "your_exact_model_id" --timeout-ms 60000
```

### 可以將 `.env.example` 複製成 `.env` 嗎？

儲存庫提供 `.env.example` 作為變數名稱參考，但現有指令碼不會自動載入 `.env`。
請透過 shell、部署平台或你自己的金鑰管理工具注入環境變數，並確保真實 key 不會
被提交。

## 本機測試（不會呼叫 API）

```bash
npm test
```

測試使用行程內 mock，不需要 `DAOXE_API_KEY`，不會連線至 DaoXE，也不會消耗餘額。
CI 還會對 JavaScript、Bash 與 Python 範例執行基本語法檢查。

如需在本機執行與 CI 相同的靜態檢查：

```bash
node --check benchmark.mjs
node --check node_chat.mjs
bash -n curl-chat.sh
python -m py_compile python_chat.py
```

## 專案結構

```text
benchmark.mjs                         單模型測試與 2～3 個模型比較工具
curl-chat.sh                          cURL Chat Completions 範例
node_chat.mjs                         Node.js OpenAI SDK 範例
python_chat.py                        Python OpenAI SDK 範例
postman/DaoXE.postman_collection.json Postman 請求集合
test/                                 不存取外部網路的本機測試
```

## 使用界線

- 執行任何真實生成請求前，請先確認目前價格與餘額。
- 只使用 `/v1/models` 或控制台目前顯示的正確模型 ID。
- 請勿將真實 API key 寫入原始碼、指令參數、日誌、報告或 Git 歷史記錄。
- benchmark 適合用於最小連線測試與同一時間點的基本延遲比較，並非完整效能評測。
