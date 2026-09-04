// WARNING (POC): vm.runInNewContext() is NOT a security sandbox.
// Malicious code can escape via prototype chain (e.g. access process, require).
// Acceptable for this internal POC because execution is triggered by a controlled
// LLM with a fixed system prompt, used by trusted Pix admins only.
// Production alternative: 'unsafe-eval' in script-src CSP (browser Worker) or
// a proper isolated subprocess / Deno sandbox.
import vm from 'node:vm';

import { logger } from '../../shared/infrastructure/utils/logger.js';

const SCRIPT_TIMEOUT_MS = 120_000;

const scriptExecutionController = {
  async runScript(request, h) {
    const { script, sheets } = request.payload;
    const authorizationHeader = request.headers.authorization;
    const apiBaseUrl = `http://127.0.0.1:${request.server.info.port}`;

    const calls = [];

    const tools = {
      call: async (name, args, options) => {
        const ligne = options?.ligne;
        const enrichedArgs = { ...args, simulate: true };
        const callEntry = { sourceRow: ligne, name, args: enrichedArgs, result: null };
        calls.push(callEntry);
        try {
          const res = await fetch(`${apiBaseUrl}/api/admin/llm-assistant/tools/${name}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: authorizationHeader },
            body: JSON.stringify(enrichedArgs),
          });
          callEntry.result = await res.json();
        } catch (err) {
          callEntry.result = { error: err?.message ?? String(err) };
        }
        return callEntry.result;
      },
    };

    const context = vm.createContext({ sheets, tools, Promise });
    const code = `(async function(sheets, tools) {\n${script}\n})(sheets, tools)`;

    let scriptReturn = null;
    try {
      const vmPromise = vm.runInContext(code, context, { timeout: 5_000 });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), SCRIPT_TIMEOUT_MS),
      );
      let result = await Promise.race([vmPromise, timeoutPromise]);
      if (Array.isArray(result) && result.length > 0 && result.every((r) => r?.then)) {
        result = await Promise.all(result);
      }
      scriptReturn = result ?? null;
    } catch (err) {
      const msg = err?.message ?? String(err);
      logger.info(`run-script erreur: ${msg}`);
      return h.response({ error: msg, calls }).code(200);
    }

    return h.response({ calls, scriptReturn }).code(200);
  },
};

export { scriptExecutionController };
