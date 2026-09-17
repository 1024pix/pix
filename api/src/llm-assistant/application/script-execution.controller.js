// WARNING (POC): vm.runInNewContext() is NOT a security sandbox.
// Malicious code can escape via prototype chain (e.g. access process, require).
// Acceptable for this internal POC because execution is triggered by a controlled
// LLM with a fixed system prompt, used by trusted Pix admins only.
// Production alternative: 'unsafe-eval' in script-src CSP (browser Worker) or
// a proper isolated subprocess / Deno sandbox.
import vm from 'node:vm';

import { createToolsRunner } from '../../mcp-admin-server/application/api/tools-api.js';
import { logger } from '../../shared/infrastructure/utils/logger.js';

// Budget total de l'exécution, attentes d'outils comprises.
const SCRIPT_TIMEOUT_MS = 120_000;

// Garde-fou contre une boucle synchrone infinie dans le script généré.
// Ne borne QUE la portion synchrone du script : dès le premier `await`, c'est
// SCRIPT_TIMEOUT_MS qui prend le relais. Une valeur trop basse coupe du travail
// légitime — c'est ce qui se produisait à 5 s.
const SYNC_EXECUTION_TIMEOUT_MS = 30_000;

// Nombre d'appels d'outils simultanés.
// Chaque appel déclenche des requêtes du serveur vers ses propres APIs internes :
// sans borne, un lot de plusieurs dizaines de lignes met le process en
// concurrence avec lui-même et les appels s'effondrent en 502/503.
const MAX_CONCURRENT_TOOL_CALLS = 4;

/**
 * Sémaphore : limite le nombre de tâches exécutées en parallèle.
 */
const _createSemaphore = function (max) {
  let inFlight = 0;
  const waiting = [];

  const _release = function () {
    inFlight -= 1;
    const next = waiting.shift();
    if (next) {
      inFlight += 1;
      next();
    }
  };

  return async function withSlot(task) {
    if (inFlight >= max) {
      await new Promise((resolve) => waiting.push(resolve));
    } else {
      inFlight += 1;
    }
    try {
      return await task();
    } finally {
      _release();
    }
  };
};

const scriptExecutionController = {
  async runScript(request, h) {
    const { script, sheets } = request.payload;
    const authorizationHeader = request.headers.authorization;
    const forwardedHeaders = {
      'x-forwarded-proto': request.headers['x-forwarded-proto'],
      'x-forwarded-host': request.headers['x-forwarded-host'],
    };
    const apiBaseUrl = `http://127.0.0.1:${request.server.info.port}`;

    // Un seul runner pour tout le lot : ses référentiels sont chargés une fois,
    // au lieu de trois requêtes internes par ligne.
    const toolsRunner = createToolsRunner({ apiBaseUrl, authorizationHeader, forwardedHeaders });
    const withSlot = _createSemaphore(MAX_CONCURRENT_TOOL_CALLS);

    const calls = [];
    const t0 = Date.now();

    const tools = {
      call: async (name, args, options) => {
        const ligne = options?.ligne;
        const enrichedArgs = { ...args, simulate: true };
        const callEntry = { sourceRow: ligne, name, args: enrichedArgs, result: null };
        calls.push(callEntry);
        try {
          callEntry.result = await withSlot(() => toolsRunner.callTool({ name, args: enrichedArgs }));
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
      const vmPromise = vm.runInContext(code, context, { timeout: SYNC_EXECUTION_TIMEOUT_MS });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Budget d'exécution dépassé (${SCRIPT_TIMEOUT_MS}ms)`)),
          SCRIPT_TIMEOUT_MS,
        ),
      );
      let result = await Promise.race([vmPromise, timeoutPromise]);
      if (Array.isArray(result) && result.length > 0 && result.every((r) => r?.then)) {
        result = await Promise.all(result);
      }
      scriptReturn = result ?? null;
    } catch (err) {
      const msg = err?.message ?? String(err);
      logger.info(`run-script erreur: ${msg} | appels=${calls.length} | durée=${Date.now() - t0}ms`);
      return h.response({ error: msg, calls }).code(200);
    }

    logger.info(`run-script ok | appels=${calls.length} | durée=${Date.now() - t0}ms`);
    return h.response({ calls, scriptReturn }).code(200);
  },
};

export { scriptExecutionController };
