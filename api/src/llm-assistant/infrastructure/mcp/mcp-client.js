import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const createMcpClient = async function ({ authorizationHeader, forwardedHeaders = {}, apiBaseUrl }) {
  const client = new Client({ name: 'llm-assistant', version: '1.0.0' });
  const transport = new StreamableHTTPClientTransport(
    new URL(`${apiBaseUrl}/api/admin/mcp`),
    {
      requestInit: {
        headers: {
          Authorization: authorizationHeader,
          // Pass through original forwarded headers so JWT audience validation succeeds
          ...forwardedHeaders,
        },
      },
    },
  );
  await client.connect(transport);
  return client;
};

export { createMcpClient };
