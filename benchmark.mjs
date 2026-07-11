#!/usr/bin/env node

import { chmod, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const DEFAULT_BASE_URL = "https://daoxe.com/v1";
export const DEFAULT_MAX_TOKENS = 8;
export const DEFAULT_TIMEOUT_MS = 30_000;
export const MAX_MODELS = 3;

const FIXED_PROMPT = "Reply with exactly: OK";
const FORMATS = new Set(["table", "json", "markdown"]);

export class CliError extends Error {}

function requireValue(args, index, flag) {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new CliError(`${flag} requires a value.`);
  }
  return value;
}

function positiveInteger(value, name, maximum) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new CliError(`${name} must be an integer between 1 and ${maximum}.`);
  }
  return parsed;
}

export function parseCli(args, env = process.env) {
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    return { help: true };
  }

  const command = args[0];
  if (command !== "smoke" && command !== "compare") {
    throw new CliError(`Unknown command: ${command}`);
  }

  const models = [];
  let format = "table";
  let formatWasSet = false;
  let output;
  let maxTokens = DEFAULT_MAX_TOKENS;
  let timeoutMs = DEFAULT_TIMEOUT_MS;

  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--format") {
      format = requireValue(args, index, arg);
      formatWasSet = true;
      index += 1;
    } else if (arg === "--output") {
      output = requireValue(args, index, arg);
      index += 1;
    } else if (arg === "--max-tokens") {
      maxTokens = positiveInteger(requireValue(args, index, arg), arg, 64);
      index += 1;
    } else if (arg === "--timeout-ms") {
      timeoutMs = positiveInteger(requireValue(args, index, arg), arg, 120_000);
      index += 1;
    } else if (arg.startsWith("--")) {
      throw new CliError(`Unknown option: ${arg}`);
    } else {
      models.push(arg);
    }
  }

  if (!formatWasSet && output?.endsWith(".json")) format = "json";
  if (!formatWasSet && output?.endsWith(".md")) format = "markdown";
  if (!FORMATS.has(format)) {
    throw new CliError("--format must be table, json, or markdown.");
  }

  if (command === "smoke") {
    if (models.length > 1) {
      throw new CliError("smoke accepts at most one model.");
    }
    const model = models[0] || env.DAOXE_MODEL;
    if (!model) {
      throw new CliError("Set DAOXE_MODEL or pass one model after smoke.");
    }
    models.splice(0, models.length, model);
  } else {
    const envModels = env.DAOXE_MODELS
      ?.split(",")
      .map((model) => model.trim())
      .filter(Boolean);
    if (models.length === 0 && envModels?.length) models.push(...envModels);
    if (models.length < 2 || models.length > MAX_MODELS) {
      throw new CliError("compare requires 2 or 3 model IDs.");
    }
    if (new Set(models).size !== models.length) {
      throw new CliError("compare model IDs must be unique.");
    }
  }

  const apiKey = env.DAOXE_API_KEY;
  if (!apiKey) {
    throw new CliError("DAOXE_API_KEY is required and must come from the environment.");
  }

  const baseUrl = (env.DAOXE_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  return {
    help: false,
    command,
    models,
    format,
    output,
    maxTokens,
    timeoutMs,
    apiKey,
    baseUrl,
  };
}

function finiteNumber(value) {
  return Number.isFinite(value) ? value : null;
}

function normalizeUsage(usage = {}) {
  const prompt = finiteNumber(usage.prompt_tokens ?? usage.input_tokens);
  const completion = finiteNumber(usage.completion_tokens ?? usage.output_tokens);
  let total = finiteNumber(usage.total_tokens);
  if (total === null && prompt !== null && completion !== null) total = prompt + completion;
  return { prompt_tokens: prompt, completion_tokens: completion, total_tokens: total };
}

export async function requestModel({
  model,
  apiKey,
  baseUrl = DEFAULT_BASE_URL,
  maxTokens = DEFAULT_MAX_TOKENS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  fetchImpl = globalThis.fetch,
}) {
  if (typeof fetchImpl !== "function") throw new Error("Node.js 18 or newer is required.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = performance.now();

  try {
    const response = await fetchImpl(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: FIXED_PROMPT }],
        max_tokens: maxTokens,
        temperature: 0,
        stream: false,
      }),
      signal: controller.signal,
    });
    const latencyMs = Math.round(performance.now() - startedAt);

    if (!response.ok) {
      try {
        await response.body?.cancel?.();
      } catch {
        // The status is still useful even if a custom response body cannot be cancelled.
      }
      return {
        model,
        ok: false,
        status: response.status,
        latency_ms: latencyMs,
        usage: normalizeUsage(),
        error: "http_error",
      };
    }

    let data;
    try {
      data = await response.json();
    } catch {
      return {
        model,
        ok: false,
        status: response.status,
        latency_ms: latencyMs,
        usage: normalizeUsage(),
        error: "invalid_json",
      };
    }

    if (!Array.isArray(data?.choices) || data.choices.length === 0) {
      return {
        model,
        ok: false,
        status: response.status,
        latency_ms: latencyMs,
        usage: normalizeUsage(data?.usage),
        error: "invalid_response",
      };
    }

    return {
      model,
      ok: true,
      status: response.status,
      latency_ms: latencyMs,
      usage: normalizeUsage(data.usage),
      error: null,
    };
  } catch (error) {
    return {
      model,
      ok: false,
      status: null,
      latency_ms: Math.round(performance.now() - startedAt),
      usage: normalizeUsage(),
      error: error?.name === "AbortError" ? "timeout" : "network_error",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function runBenchmark(options) {
  const results = [];
  for (const model of options.models) {
    results.push(await requestModel({ ...options, model }));
  }
  return {
    created_at: new Date().toISOString(),
    endpoint: `${options.baseUrl.replace(/\/+$/, "")}/chat/completions`,
    max_tokens: options.maxTokens,
    requests_sent: results.length,
    results,
  };
}

function safeCell(value) {
  if (value === null || value === undefined) return "-";
  return String(value).replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
}

function markdownCell(value) {
  return safeCell(value).replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
}

export function renderReport(report, format = "table") {
  if (format === "json") return `${JSON.stringify(report, null, 2)}\n`;

  const rows = report.results.map((result) => [
    result.model,
    result.ok ? "ok" : result.error,
    result.status,
    result.latency_ms,
    result.usage.prompt_tokens,
    result.usage.completion_tokens,
    result.usage.total_tokens,
  ]);
  const headers = ["Model", "Result", "HTTP", "Latency ms", "Input", "Output", "Total"];

  if (format === "markdown") {
    const lines = [
      "# DaoXE benchmark report",
      "",
      `- Created: ${report.created_at}`,
      `- Endpoint: ${report.endpoint}`,
      `- Maximum output tokens per request: ${report.max_tokens}`,
      "",
      `| ${headers.join(" | ")} |`,
      `| ${headers.map(() => "---").join(" | ")} |`,
      ...rows.map((row) => `| ${row.map(markdownCell).join(" | ")} |`),
      "",
      "The report excludes API keys, prompts, and response text.",
      "",
    ];
    return lines.join("\n");
  }

  const widths = headers.map((header, column) =>
    Math.max(header.length, ...rows.map((row) => safeCell(row[column]).length)),
  );
  const line = (row) =>
    row.map((cell, column) => safeCell(cell).padEnd(widths[column])).join("  ");
  return `${line(headers)}\n${widths.map((width) => "-".repeat(width)).join("  ")}\n${rows
    .map(line)
    .join("\n")}\n`;
}

export function usage() {
  return `DaoXE low-cost benchmark (Node.js 18+; no runtime dependencies)

Usage:
  DAOXE_API_KEY=... DAOXE_MODEL=model-id npm run smoke
  DAOXE_API_KEY=... npm run smoke -- model-id
  DAOXE_API_KEY=... npm run compare -- model-1 model-2 [model-3]

Options:
  --format table|json|markdown  Console/report format (default: table)
  --output FILE                Save the sanitized report to a file
  --max-tokens N               Maximum output tokens, 1-64 (default: 8)
  --timeout-ms N               Per-request timeout, up to 120000 (default: 30000)
  --help                       Show this help

Each model causes one potentially billable live request. API keys are read only
from DAOXE_API_KEY. Prompts, responses, and keys are never included in output.
`;
}

export async function main(args = process.argv.slice(2), env = process.env) {
  let options;
  try {
    options = parseCli(args, env);
  } catch (error) {
    const message = error instanceof CliError ? error.message : "Invalid command.";
    console.error(`Error: ${message}`);
    console.error("Run with --help for usage.");
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    process.stdout.write(usage());
    return;
  }

  console.error(
    `Cost notice: sending ${options.models.length} live request(s), one per model, ` +
      `with max_tokens=${options.maxTokens}. Check current DaoXE pricing and balance first.`,
  );

  const report = await runBenchmark(options);
  const rendered = renderReport(report, options.format);
  process.stdout.write(rendered);

  if (options.output) {
    await writeFile(options.output, rendered, { encoding: "utf8", mode: 0o600 });
    await chmod(options.output, 0o600);
    console.error(`Sanitized report saved to ${options.output}`);
  }

  if (report.results.some((result) => !result.ok)) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (invokedPath === import.meta.url) {
  main().catch(() => {
    console.error("Benchmark failed before a report could be produced.");
    process.exitCode = 1;
  });
}
