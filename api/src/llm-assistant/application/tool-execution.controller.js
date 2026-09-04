import { logger } from '../../shared/infrastructure/utils/logger.js';
import { createMcpClient } from '../infrastructure/mcp/mcp-client.js';

const CONNECT_TIMEOUT_MS = 5_000;
const CALL_TIMEOUT_MS = 15_000;

const toolExecutionController = {
  async listTools(request, h) {
    const authorizationHeader = request.headers.authorization;
    const forwardedHeaders = {
      'x-forwarded-proto': request.headers['x-forwarded-proto'],
      'x-forwarded-host': request.headers['x-forwarded-host'],
    };
    const apiBaseUrl = `http://127.0.0.1:${request.server.info.port}`;

    let client;
    try {
      client = await createMcpClient({ authorizationHeader, forwardedHeaders, apiBaseUrl });
      const { tools } = await client.listTools();
      const result = tools.map((tool) => ({
        name: tool.name,
        readOnlyHint: tool.annotations?.readOnlyHint ?? false,
      }));
      return h.response(result).code(200);
    } finally {
      // eslint-disable-next-line no-empty-function
      if (client) await client.close().catch(() => {});
    }
  },

  async relayTool(request, h) {
    const { toolName } = request.params;
    const args = request.payload ?? {};
    const authorizationHeader = request.headers.authorization;
    const forwardedHeaders = {
      'x-forwarded-proto': request.headers['x-forwarded-proto'],
      'x-forwarded-host': request.headers['x-forwarded-host'],
    };
    // Use loopback + actual bound port (not 0.0.0.0) to avoid Scalingo's load balancer
    // rewriting x-forwarded-host, which would break JWT audience validation.
    const apiBaseUrl = `http://127.0.0.1:${request.server.info.port}`;

    logger.info(`relais → ${toolName}`);
    const t0 = Date.now();

    let client;
    let result;
    try {
      // Timeout guards against silent hangs (e.g. 0.0.0.0 connections on Linux).
      const connectTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`MCP connection timeout after ${CONNECT_TIMEOUT_MS}ms`)), CONNECT_TIMEOUT_MS),
      );
      client = await Promise.race([createMcpClient({ authorizationHeader, forwardedHeaders, apiBaseUrl }), connectTimeout]);
      const callTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`MCP tool call timeout after ${CALL_TIMEOUT_MS}ms`)), CALL_TIMEOUT_MS),
      );
      result = await Promise.race([client.callTool({ name: toolName, arguments: args }), callTimeout]);
    } catch (err) {
      // transport MCP injoignable (connexion refusée, réseau inaccessible…)
      logger.info(`relais ← ${toolName} | durée=${Date.now() - t0}ms | statut=panne-transport`);
      return h.response({ error: { relay: err.message } }).code(502);
    } finally {
      // eslint-disable-next-line no-empty-function
      if (client) await client.close().catch(() => {});
    }

    logger.info(`relais ← ${toolName} | durée=${Date.now() - t0}ms | statut=${result.isError ? 'erreur' : 'ok'}`);

    if (!result.isError) {
      // Succès ou erreur métier propre retournée sans isError
      return h.response(JSON.parse(result.content[0].text)).code(200);
    }

    const errText = result.content[0]?.text ?? '';

    // callTool ne lève jamais d'exception sur SDK v1.30+ : les erreurs de protocole arrivent
    // en isError:true avec préfixe "MCP error". Discriminant outil inconnu : "not found".
    if (errText.startsWith('MCP error')) {
      if (errText.includes('not found')) {
        return h.response({ error: { unknownTool: toolName } }).code(404);
      }
      return h.response({ error: { validation: errText } }).code(200);
    }

    // Erreur propre à l'outil (isError:true mais pas un message de protocole)
    return h.response(JSON.parse(errText)).code(200);
  },
};

export { toolExecutionController };
