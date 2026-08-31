import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { createMcpServer } from '../infrastructure/mcp/mcp-server.js';

const mcpController = {
  async handle(request, h) {
    const authorizationHeader = request.headers.authorization;
    const forwardedHeaders = {
      'x-forwarded-proto': request.headers['x-forwarded-proto'],
      'x-forwarded-host': request.headers['x-forwarded-host'],
    };
    // request.server.info.uri gives the real server URL (e.g. "http://localhost:3000")
    // which is correct even in tests with config.port = 0 (dynamic port)
    const apiBaseUrl = request.server.info.uri;

    const server = await createMcpServer({ authorizationHeader, forwardedHeaders, apiBaseUrl });
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

    await server.connect(transport);

    await transport.handleRequest(request.raw.req, request.raw.res, request.payload);

    return h.abandon;
  },
};

export { mcpController };
