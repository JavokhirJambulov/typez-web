import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const script = readFileSync(new URL("../waitlist.js", import.meta.url), "utf8");

function setup(fetch) {
  const button = { disabled: false, textContent: "Join the waitlist" };
  const status = { textContent: "", dataset: {} };
  const form = {
    action: "https://example.sibforms.com/serve/test",
    email: "test@example.com",
    querySelector: () => button,
    addEventListener: (_, handler) => { form.submit = handler; },
    reset: () => { form.email = ""; },
  };
  class FormData {
    constructor(submitted) { this.email = submitted.email; }
  }
  runInNewContext(script, {
    document: { querySelector: (selector) => selector === "#waitlist-form" ? form : status },
    fetch, FormData, AbortSignal,
  });
  return { form, button, status, submit: () => form.submit({ preventDefault() {} }) };
}

test("posts to Brevo and announces success only after confirmation", async () => {
  let finish;
  const page = setup((url, options) => {
    assert.equal(url, "https://example.sibforms.com/serve/test?isAjax=1");
    assert.equal(options.method, "POST");
    assert.equal(options.body.email, "test@example.com");
    return new Promise((resolve) => { finish = resolve; });
  });
  const pending = page.submit();
  assert.equal(page.button.disabled, true);
  assert.equal(page.status.textContent, "");
  await page.submit(); // A second submit while pending must not send again.
  finish({ ok: true, json: async () => ({ success: true }) });
  await pending;
  assert.match(page.status.textContent, /You're on the list/);
  assert.match(page.status.textContent, /TestFlight invitation/);
  assert.equal(page.form.email, "");
  assert.equal(page.button.disabled, false);
});

test("failed, rejected, malformed, and timed-out requests keep the email for retry", async () => {
  for (const fetch of [
    async () => ({ ok: false, json: async () => ({ success: true }) }),
    async () => ({ ok: true, json: async () => ({ success: false }) }),
    async () => ({ ok: true, json: async () => ({ success: "true" }) }),
    async () => ({ ok: true, json: async () => { throw new SyntaxError(); } }),
    async () => { throw new TypeError("Network error"); },
    async () => { throw new DOMException("Timeout", "TimeoutError"); },
  ]) {
    const page = setup(fetch);
    await page.submit();
    assert.equal(page.status.dataset.error, "true");
    assert.match(page.status.textContent, /couldn't save/);
    assert.equal(page.form.email, "test@example.com");
    assert.equal(page.button.disabled, false);
    assert.equal(page.button.textContent, "Join the waitlist");
  }
});
