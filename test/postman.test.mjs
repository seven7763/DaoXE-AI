import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const collectionPath = new URL(
  "../postman/DaoXE.postman_collection.json",
  import.meta.url,
);
const environmentPath = new URL(
  "../postman/DaoXE.example.postman_environment.json",
  import.meta.url,
);

const collection = JSON.parse(await readFile(collectionPath, "utf8"));
const environment = JSON.parse(await readFile(environmentPath, "utf8"));

function flattenRequests(items) {
  return items.flatMap((item) =>
    item.request ? [item] : flattenRequests(item.item ?? []),
  );
}

function headersByName(request) {
  return Object.fromEntries(
    request.header.map(({ key, value }) => [key.toLowerCase(), value]),
  );
}

test("Postman artifacts use importable v2.1 structures", () => {
  assert.equal(
    collection.info.schema,
    "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  );
  assert.equal(environment._postman_variable_scope, "environment");
  assert.ok(Array.isArray(collection.item));
  assert.ok(Array.isArray(environment.values));
});

test("collection contains exactly the four documented DaoXE endpoints", () => {
  const requests = flattenRequests(collection.item);
  const endpoints = requests.map(({ request }) => [
    request.method,
    request.url.raw,
  ]);

  assert.deepEqual(endpoints, [
    ["GET", "https://daoxe.com/v1/models"],
    ["POST", "https://daoxe.com/v1/chat/completions"],
    ["POST", "https://daoxe.com/v1/messages"],
    ["POST", "https://daoxe.com/v1/responses"],
  ]);
});

test("API key and model are referenced only through the documented variables", () => {
  const requests = flattenRequests(collection.item);

  for (const { request } of requests) {
    const headers = headersByName(request);
    if (request.url.raw.endsWith("/messages")) {
      assert.equal(headers["x-api-key"], "{{DAOXE_API_KEY}}");
      assert.equal(headers.authorization, undefined);
    } else {
      assert.equal(headers.authorization, "Bearer {{DAOXE_API_KEY}}");
      assert.equal(headers["x-api-key"], undefined);
    }

    if (request.body) {
      const body = JSON.parse(request.body.raw);
      assert.equal(body.model, "{{DAOXE_MODEL}}");
    }
  }

  assert.deepEqual(
    environment.values.map(({ key }) => key),
    ["DAOXE_API_KEY", "DAOXE_MODEL"],
  );
  assert.equal(environment.values[0].value, "");
  assert.equal(environment.values[0].type, "secret");
  assert.equal(environment.values[1].value, "");
});

test("generated requests keep prompts and output limits deliberately small", () => {
  const generatedRequests = flattenRequests(collection.item).filter(
    ({ request }) => request.body,
  );

  for (const { request } of generatedRequests) {
    const body = JSON.parse(request.body.raw);
    const prompt = body.input ?? body.messages?.[0]?.content;
    const tokenLimit = body.max_output_tokens ?? body.max_tokens;

    assert.equal(prompt, "Reply with OK.");
    assert.equal(tokenLimit, 8);
    assert.equal(body.stream, false);
  }
});

test("Postman exports contain no credential-shaped literal", () => {
  const artifacts = `${JSON.stringify(collection)}\n${JSON.stringify(environment)}`;

  assert.doesNotMatch(artifacts, /sk-[A-Za-z0-9_-]{8,}/);
  assert.doesNotMatch(artifacts, /Bearer (?!\{\{DAOXE_API_KEY\}\})\S+/);
  assert.equal((artifacts.match(/\{\{DAOXE_API_KEY\}\}/g) ?? []).length, 4);
  assert.equal((artifacts.match(/\{\{DAOXE_MODEL\}\}/g) ?? []).length, 3);
});
