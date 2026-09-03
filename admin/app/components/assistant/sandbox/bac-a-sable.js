const TIMEOUT_MS = 120_000;
const MAX_TOOL_CALLS = 500;

/**
 * Builds the srcdoc HTML for the sandboxed iframe.
 * The user script is embedded via JSON.stringify to safely escape any
 * characters that would break the surrounding template literal / script tag.
 *
 * @param {string} script - The user-supplied JS code to execute.
 * @returns {string} Full HTML document string.
 */
function buildSrcdoc(script) {
  // JSON.stringify produces a quoted string like "\"..user script..\"".
  // We slice off the surrounding double-quotes and use the result as the
  // body of a `new Function` call so that the script runs with `sheets`
  // and `tools` available in the enclosing async IIFE scope.
  const escapedScript = JSON.stringify(script);

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body><script>
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
      window.parent.postMessage({ type: 'tool.call', id: id, name: name, args: args, ligne: ligne }, '*');
      return p;
    }
  };

  window.addEventListener('message', function (e) {
    var data = e.data;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'init') {
      var sheets = data.sheets;
      var userScript = ${escapedScript};
      Promise.resolve()
        .then(function () {
          return new Function('sheets', 'tools', '"use strict";\\nreturn (async function() {\\n' + userScript + '\\n})();')(sheets, tools);
        })
        .then(function (result) {
          window.parent.postMessage({ type: 'done', result: result !== undefined ? result : null }, '*');
        })
        .catch(function (err) {
          window.parent.postMessage({ type: 'error', message: err && err.message ? err.message : String(err) }, '*');
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
</script></body></html>`;
}

/**
 * Executes a user-supplied script inside a sandboxed iframe.
 *
 * The script has access to:
 *   - `sheets` — the data object provided by the caller
 *   - `tools.call(name, args, { ligne })` — async function that routes tool
 *     calls through `onToolCall` on the host side
 *
 * The caller's `onToolCall` is responsible for injecting any extra fields
 * (e.g. `simulate: true`) before forwarding to the actual API. This function
 * passes args through faithfully without modification.
 *
 * @param {object} options
 * @param {string}   options.script      - JS source code to execute.
 * @param {object}   options.sheets      - Data available to the script.
 * @param {Function} options.onToolCall  - Async callback `({ id, name, args, ligne })` → result.
 * @returns {Promise<void>} Resolves when the script posts `done`, rejects on error or timeout.
 */
export async function execute({ script, sheets, onToolCall }) {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.style.display = 'none';

    let finished = false;
    let pendingCalls = 0;
    let totalCalls = 0;
    let doneReceived = false;
    let scriptResult = null;

    function cleanup() {
      finished = true;
      window.removeEventListener('message', onMessage);
      clearTimeout(timeoutHandle);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }

    function checkDone() {
      if (doneReceived && pendingCalls === 0) {
        cleanup();
        resolve(scriptResult);
      }
    }

    async function onMessage(event) {
      // Only accept messages from our iframe.
      if (event.source !== iframe.contentWindow) return;

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
            iframe.contentWindow.postMessage({ type: 'tool.result', id: data.id, result }, '*');
          }
        } catch (err) {
          // Surface tool errors back to the script as a result so execution can continue.
          if (!finished) {
            iframe.contentWindow.postMessage(
              {
                type: 'tool.result',
                id: data.id,
                result: { error: err && err.message ? err.message : String(err) },
              },
              '*',
            );
          }
        } finally {
          pendingCalls--;
          checkDone();
        }
        return;
      }

      if (data.type === 'done') {
        // Remove listener now — no more messages expected from the script.
        // But defer cleanup/resolve until all pending onToolCall invocations finish.
        window.removeEventListener('message', onMessage);
        doneReceived = true;
        // Capture the script's return value to pass to resolve().
        // Overwrite on each done so we always have the final value.
        scriptResult = data.result;
        checkDone();
        return;
      }

      if (data.type === 'error') {
        cleanup();
        reject(new Error(data.message));
        return;
      }
    }

    window.addEventListener('message', onMessage);

    const timeoutHandle = setTimeout(() => {
      cleanup();
      reject(new Error('timeout'));
    }, TIMEOUT_MS);

    iframe.addEventListener('load', () => {
      if (!finished) {
        iframe.contentWindow.postMessage({ type: 'init', sheets }, '*');
      }
    });

    iframe.srcdoc = buildSrcdoc(script);
    document.body.appendChild(iframe);
  });
}
