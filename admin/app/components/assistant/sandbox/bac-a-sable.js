const TIMEOUT_MS = 120_000;
const MAX_TOOL_CALLS = 500;

/**
 * Executes a user-supplied script inside a Web Worker.
 *
 * The Worker is loaded from /sandbox-worker.js (a static file served by
 * 'self'), which is allowed by script-src 'self' without needing blob: or
 * unsafe-inline. Using a static file instead of a blob: URL is necessary
 * because Firefox does not cover blob: under script-src 'self'.
 *
 * The script has access to:
 *   - `sheets` — the data object provided by the caller
 *   - `tools.call(name, args, { ligne })` — async function that routes tool
 *     calls through `onToolCall` on the host side
 *
 * @param {object} options
 * @param {string}   options.script      - JS source code to execute.
 * @param {object}   options.sheets      - Data available to the script.
 * @param {Function} options.onToolCall  - Async callback `({ id, name, args, ligne })` → result.
 * @returns {Promise<void>} Resolves when the worker posts `done`, rejects on error or timeout.
 */
export async function execute({ script, sheets, onToolCall }) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('/sandbox-worker.js');

    let finished = false;
    let pendingCalls = 0;
    let totalCalls = 0;
    let doneReceived = false;
    let scriptResult = null;

    function cleanup() {
      finished = true;
      worker.terminate();
      clearTimeout(timeoutHandle);
    }

    function checkDone() {
      if (doneReceived && pendingCalls === 0) {
        cleanup();
        resolve(scriptResult);
      }
    }

    worker.onmessage = async function (event) {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'tool.call') {
        totalCalls++;
        if (totalCalls > MAX_TOOL_CALLS) {
          cleanup();
          reject(new Error(`Script exceeded the tool call limit (${MAX_TOOL_CALLS})`));
          return;
        }
        pendingCalls++;
        try {
          const result = await onToolCall({ id: data.id, name: data.name, args: data.args, ligne: data.ligne });
          if (!finished) {
            worker.postMessage({ type: 'tool.result', id: data.id, result });
          }
        } catch (err) {
          if (!finished) {
            worker.postMessage({
              type: 'tool.result',
              id: data.id,
              result: { error: err && err.message ? err.message : String(err) },
            });
          }
        } finally {
          pendingCalls--;
          checkDone();
        }
        return;
      }

      if (data.type === 'done') {
        doneReceived = true;
        scriptResult = data.result;
        checkDone();
        return;
      }

      if (data.type === 'error') {
        cleanup();
        reject(new Error(data.message));
        return;
      }
    };

    worker.onerror = function (err) {
      cleanup();
      reject(new Error(err.message ?? 'Worker error'));
    };

    const timeoutHandle = setTimeout(() => {
      cleanup();
      reject(new Error('timeout'));
    }, TIMEOUT_MS);

    worker.postMessage({ type: 'init', sheets, script });
  });
}
