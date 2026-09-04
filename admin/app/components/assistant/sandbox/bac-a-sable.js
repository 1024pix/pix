const TIMEOUT_MS = 120_000;
const MAX_TOOL_CALLS = 500;

function buildWorkerScript() {
  return `
(function () {
  'use strict';

  var pendingCalls = new Map();

  var tools = {
    call: function call(name, args, options) {
      var ligne = (options && options.ligne) !== undefined ? options.ligne : undefined;
      var id = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      var p = new Promise(function (resolve) {
        pendingCalls.set(id, resolve);
      });
      self.postMessage({ type: 'tool.call', id: id, name: name, args: args, ligne: ligne });
      return p;
    }
  };

  self.addEventListener('message', function (e) {
    var data = e.data;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'init') {
      var sheets = data.sheets;
      var userScript = data.script;
      Promise.resolve()
        .then(function () {
          return new Function('sheets', 'tools', '"use strict";\\nreturn (async function() {\\n' + userScript + '\\n})();')(sheets, tools);
        })
        .then(function (result) {
          if (Array.isArray(result) && result.length > 0 && result.every(function(r) {
            return r !== null && typeof r === 'object' && typeof r.then === 'function';
          })) {
            return Promise.all(result);
          }
          return result;
        })
        .then(function (result) {
          self.postMessage({ type: 'done', result: result !== undefined ? result : null });
        })
        .catch(function (err) {
          self.postMessage({ type: 'error', message: err && err.message ? err.message : String(err) });
        });
    }

    if (data.type === 'tool.result') {
      var resolve = pendingCalls.get(data.id);
      if (resolve) {
        pendingCalls.delete(data.id);
        resolve(data.result);
      }
    }
  });
})();
`;
}

/**
 * Executes a user-supplied script inside a Web Worker.
 *
 * Using a Worker (blob: URL from same origin) instead of an iframe avoids
 * two CSP restrictions present in production:
 *   - frame-src does not include 'self' or about:srcdoc
 *   - script-src does not allow inline scripts (which data: iframes inherit)
 * blob: URLs created from the page origin are covered by script-src 'self'.
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
    const blob = new Blob([buildWorkerScript()], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    URL.revokeObjectURL(workerUrl);

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
