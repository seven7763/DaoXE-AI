import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import {
  DEFAULT_MAX_TOKENS,
  CliError,
  parseCli,
  renderReport,
  requestModel,
} from "../benchmark.mjs";

const execFileAsync = promisify(execFile);

test("smoke reads its key and default model only from the environment", () => {
  const options = parseCli(["smoke"], {
    DAOXE_API_KEY: "test-secret-key",
    DAOXE_MODEL: "test-model",
  });

  assert.equal(options.apiKey, "test-secret-key");
  assert.deepEqual(options.models, ["test-model"]);
  assert.equal(options.maxTokens, DEFAULT_MAX_TOKENS);
});

test("compare accepts no more than three unique models", () => {
  assert.deepEqual(
    parseCli(["compare", "one", "two", "three"], { DAOXE_API_KEY: "key" }).models,
    ["one", "two", "three"],
  );
  assert.throws(
    () => parseCli(["compare", "one", "two", "three", "four"], { DAOXE_API_KEY: "key" }),
    CliError,
  );
  assert.throws(
    () => parseCli(["compare", "same", "same"], { DAOXE_API_KEY: "key" }),
    CliError,
  );
});

test("requestModel sends a minimal request and returns only safe metrics", async () => {
  const apiKey = "secret-that-must-not-leak";
  const responseText = "private model response";
  let capturedUrl;
  let capturedOptions;
  const fetchImpl = async (url, options) => {
    capturedUrl = url;
    capturedOptions = options;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: responseText } }],
        usage: { prompt_tokens: 7, completion_tokens: 1, total_tokens: 8 },
      }),
    };
  };

  const result = await requestModel({
    model: "mock-model",
    apiKey,
    baseUrl: "https://example.invalid/v1/",
    fetchImpl,
  });

  assert.equal(capturedUrl, "https://example.invalid/v1/chat/completions");
  assert.equal(capturedOptions.headers.Authorization, `Bearer ${apiKey}`);
  const requestBody = JSON.parse(capturedOptions.body);
  assert.equal(requestBody.max_tokens, DEFAULT_MAX_TOKENS);
  assert.equal(requestBody.stream, false);
  assert.equal(result.ok, true);
  assert.deepEqual(result.usage, {
    prompt_tokens: 7,
    completion_tokens: 1,
    total_tokens: 8,
  });

  const rendered = renderReport(
    {
      created_at: "2026-01-01T00:00:00.000Z",
      endpoint: capturedUrl,
      max_tokens: DEFAULT_MAX_TOKENS,
      requests_sent: 1,
      results: [result],
    },
    "json",
  );
  assert.doesNotMatch(rendered, new RegExp(apiKey));
  assert.doesNotMatch(rendered, new RegExp(responseText));
  assert.doesNotMatch(rendered, /Reply with exactly/);
});

test("HTTP failures do not copy the response body into reports", async () => {
  const result = await requestModel({
    model: "mock-model",
    apiKey: "key",
    fetchImpl: async () => ({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: "sensitive reflected text" } }),
    }),
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 429);
  assert.equal(result.error, "http_error");
  assert.doesNotMatch(JSON.stringify(result), /sensitive reflected text/);
});

test("markdown output escapes model IDs and contains no content fields", () => {
  const output = renderReport(
    {
      created_at: "2026-01-01T00:00:00.000Z",
      endpoint: "https://daoxe.com/v1/chat/completions",
      max_tokens: 8,
      requests_sent: 1,
      results: [
        {
          model: "vendor/model|latest",
          ok: true,
          status: 200,
          latency_ms: 123,
          usage: { prompt_tokens: 7, completion_tokens: 1, total_tokens: 8 },
          error: null,
        },
      ],
    },
    "markdown",
  );

  assert.match(output, /vendor\/model\\\|latest/);
  assert.match(output, /excludes API keys, prompts, and response text/);
});

test("CLI smoke command works end to end against a local mock", async () => {
  const apiKey = "end-to-end-secret";
  const responseText = "end-to-end private response";
  let receivedPath;
  let receivedAuthorization;
  const server = createServer((request, response) => {
    receivedPath = request.url;
    receivedAuthorization = request.headers.authorization;
    request.resume();
    request.on("end", () => {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          choices: [{ message: { content: responseText } }],
          usage: { prompt_tokens: 5, completion_tokens: 1, total_tokens: 6 },
        }),
      );
    });
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address();
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [fileURLToPath(new URL("../benchmark.mjs", import.meta.url)), "smoke", "mock-model", "--format", "json"],
      {
        env: {
          ...process.env,
          DAOXE_API_KEY: apiKey,
          DAOXE_BASE_URL: `http://127.0.0.1:${address.port}/v1`,
        },
      },
    );

    const report = JSON.parse(stdout);
    assert.equal(receivedPath, "/v1/chat/completions");
    assert.equal(receivedAuthorization, `Bearer ${apiKey}`);
    assert.equal(report.results[0].ok, true);
    assert.equal(report.results[0].status, 200);
    assert.equal(report.results[0].usage.total_tokens, 6);
    assert.doesNotMatch(`${stdout}\n${stderr}`, new RegExp(apiKey));
    assert.doesNotMatch(`${stdout}\n${stderr}`, new RegExp(responseText));
    assert.doesNotMatch(`${stdout}\n${stderr}`, /Reply with exactly/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
