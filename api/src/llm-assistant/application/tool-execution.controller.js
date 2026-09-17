import { createToolsRunner } from '../../mcp-admin-server/application/api/tools-api.js';
import { logger } from '../../shared/infrastructure/utils/logger.js';
import { createMcpClient } from '../infrastructure/mcp/mcp-client.js';

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
    // Les repositories de mcp-admin-server s'adressent aux APIs internes en HTTP.
    // Loopback + port réellement écouté (et non 0.0.0.0) pour éviter que le load
    // balancer de Scalingo ne réécrive x-forwarded-host, ce qui casserait la
    // validation d'audience du JWT.
    const apiBaseUrl = `http://127.0.0.1:${request.server.info.port}`;

    logger.info(`relais → ${toolName}`);
    const t0 = Date.now();

    // Appel direct en process : plus de session MCP ouverte puis refermée à
    // chaque outil, ce qui coûtait un aller-retour HTTP du serveur vers lui-même
    // avant même d'atteindre le usecase.
    const toolsRunner = createToolsRunner({ apiBaseUrl, authorizationHeader, forwardedHeaders });

    let result;
    try {
      result = await toolsRunner.callTool({ name: toolName, args });
    } catch (err) {
      // APIs internes injoignables (connexion refusée, réseau inaccessible…)
      logger.info(`relais ← ${toolName} | durée=${Date.now() - t0}ms | statut=panne-transport`);
      return h.response({ error: { relay: err.message } }).code(502);
    }

    const isError = Boolean(result?.error);
    logger.info(`relais ← ${toolName} | durée=${Date.now() - t0}ms | statut=${isError ? 'erreur' : 'ok'}`);

    if (result?.error?.unknownTool) {
      return h.response(result).code(404);
    }

    return h.response(result).code(200);
  },
};

export { toolExecutionController };
