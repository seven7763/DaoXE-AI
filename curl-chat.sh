#!/usr/bin/env bash
set -euo pipefail

: "${DAOXE_API_KEY:?Set DAOXE_API_KEY first}"
: "${DAOXE_MODEL:?Set DAOXE_MODEL to an exact model ID first}"

curl --fail-with-body --show-error --silent --max-time 60 \
  https://daoxe.com/v1/chat/completions \
  -H "Authorization: Bearer ${DAOXE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "'"${DAOXE_MODEL}"'",
    "max_tokens": 64,
    "messages": [
      {"role": "user", "content": "Write one practical tip for evaluating LLM APIs."}
    ]
  }'
