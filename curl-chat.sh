#!/usr/bin/env bash
set -euo pipefail

: "${DAOXE_API_KEY:?Set DAOXE_API_KEY first}"
: "${DAOXE_MODEL:=MODEL_NAME}"

curl https://daoxe.com/v1/chat/completions \
  -H "Authorization: Bearer ${DAOXE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "'"${DAOXE_MODEL}"'",
    "messages": [
      {"role": "user", "content": "Write one practical tip for evaluating LLM APIs."}
    ]
  }'
