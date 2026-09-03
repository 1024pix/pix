import { randomUUID } from 'node:crypto';

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { createMcpServer } from '../infrastructure/mcp/mcp-server.js';

// Session registry: sessionId → transport (cleaned up via onsessionclosed)
const sessions = new Map();

const mcpController = {
  async handle(request, h) {
    const authorizationHeader = request.headers.authorization;
    const forwardedHeaders = {
      'x-forwarded-proto': request.headers['x-forwarded-proto'],
      'x-forwarded-host': request.headers['x-forwarded-host'],
    };
    const apiBaseUrl = request.server.info.uri;

    const sessionId = request.headers['mcp-session-id'];
    if (sessionId) {
      const transport = sessions.get(sessionId);
      if (!transport) {
        return h.response({ error: 'Session not found or expired' }).code(404);
      }
      await transport.handleRequest(request.raw.req, request.raw.res, request.payload);
      return h.abandon;
    }

    let transport;
    const server = await createMcpServer({ authorizationHeader, forwardedHeaders, apiBaseUrl });
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => { sessions.set(id, transport); },
      onsessionclosed: (id) => { sessions.delete(id); },
    });

    await server.connect(transport);
    await transport.handleRequest(request.raw.req, request.raw.res, request.payload);

    return h.abandon;
  },

  async handleSse(request, h) {
    const sessionId = request.headers['mcp-session-id'];
    if (!sessionId) {
      return h.response({ error: 'Missing Mcp-Session-Id header' }).code(400);
    }
    const transport = sessions.get(sessionId);
    if (!transport) {
      return h.response({ error: 'Session not found or expired' }).code(404);
    }
    try {
      await transport.handleRequest(request.raw.req, request.raw.res);
    } catch {
      // Client disconnected mid-stream — response headers already sent, nothing to do.
    }
    return h.abandon;
  },
};

export { mcpController };
