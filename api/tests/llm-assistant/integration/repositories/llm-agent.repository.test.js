import http from 'node:http';

import nock from 'nock';

import { streamConversationTurn } from '../../../../src/llm-assistant/infrastructure/repositories/llm-agent.repository.js';
import { config } from '../../../../src/shared/config.js';
import { expect } from '../../../test-helper.js';
import { waitForStreamFinalizationToBeDone } from '../../../tooling/test-utils/wait.js';

/**
 * Démarre un faux serveur MCP HTTP local qui répond au protocole MCP sur StreamableHTTP.
 * Gère initialize, notifications/initialized et tools/list.
 * Retourne { port, close }.
 */
function startFakeMcpServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        if (!body) {
          res.writeHead(200);
          res.end();
          return;
        }

        let rpc;
        try {
          rpc = JSON.parse(body);
        } catch {
          res.writeHead(400);
          res.end();
          return;
        }

        // Les notifications JSON-RPC n'ont pas d'id — on répond 202 sans corps
        if (rpc.id === undefined || rpc.id === null) {
          res.writeHead(202);
          res.end();
          return;
        }

        let responsePayload;
        if (rpc.method === 'initialize') {
          responsePayload = JSON.stringify({
            jsonrpc: '2.0',
            id: rpc.id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: { tools: {} },
              serverInfo: { name: 'fake-mcp', version: '1.0.0' },
            },
          });
        } else if (rpc.method === 'tools/list') {
          responsePayload = JSON.stringify({
            jsonrpc: '2.0',
            id: rpc.id,
            result: { tools: [] },
          });
        } else {
          res.writeHead(404);
          res.end();
          return;
        }

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        });
        res.write(`data: ${responsePayload}\n\n`);
        res.end();
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        port,
        close: () => new Promise((res) => server.close(res)),
      });
    });
  });
}

/**
 * Démarre un serveur HTTP local qui répond à toute requête POST avec les chunks SSE fournis.
 * Retourne { port, close }.
 */
function startFakeInferenceServer(sseChunks) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      for (const chunk of sseChunks) {
        res.write(chunk);
      }
      res.end();
    });

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        port,
        close: () => new Promise((res) => server.close(res)),
      });
    });
  });
}

describe('LlmAssistant | Integration | Infrastructure | Repositories | llm-agent', function () {
  describe('#streamConversationTurn', function () {
    // Messages au format ModelMessage (content string simple)
    const messages = [{ role: 'user', content: 'Crée une organisation' }];
    const authorizationHeader = 'Bearer some-token';

    let originalInferenceUrl;
    let originalBaseUrl;
    let mcpServer;

    beforeEach(async function () {
      originalInferenceUrl = config.llmAssistant.inferenceUrl;
      originalBaseUrl = config.baseUrl;
      // Autorise les connexions vers 127.0.0.1 pour les serveurs fake locaux
      nock.enableNetConnect('127.0.0.1');
      // Démarre le faux serveur MCP pour tous les tests
      mcpServer = await startFakeMcpServer();
      config.baseUrl = `http://127.0.0.1:${mcpServer.port}`;
    });

    afterEach(async function () {
      config.llmAssistant.inferenceUrl = originalInferenceUrl;
      config.baseUrl = originalBaseUrl;
      await mcpServer.close();
      nock.disableNetConnect();
      nock.enableNetConnect('localhost:9090');
    });

    context('scenario 1: simple text response', function () {
      it('returns a non-empty ReadableStream', async function () {
        // given — format SSE OpenAI compatible
        // Le AI SDK appelle POST {inferenceUrl}/chat/completions
        const sseChunks = [
          'data: {"id":"chatcmpl-1","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":"Bonjour"},"finish_reason":null}]}\n\n',
          'data: {"id":"chatcmpl-1","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"!"},"finish_reason":null}]}\n\n',
          'data: {"id":"chatcmpl-1","object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n',
          'data: [DONE]\n\n',
        ];

        const { port, close } = await startFakeInferenceServer(sseChunks);
        config.llmAssistant.inferenceUrl = `http://127.0.0.1:${port}`;

        try {
          // when
          const stream = await streamConversationTurn({ messages, authorizationHeader });

          // then
          expect(stream).to.be.instanceOf(ReadableStream);

          const parts = [];
          const decoder = new TextDecoder();
          for await (const chunk of stream) {
            parts.push(decoder.decode(chunk));
          }
          await waitForStreamFinalizationToBeDone();

          const fullResponse = parts.join('');
          expect(fullResponse).to.not.be.empty;
        } finally {
          await close();
        }
      });
    });

    context('scenario 2: tool call (sequence measured 2026-08-24)', function () {
      it('returns a non-empty ReadableStream without error', async function () {
        // given — séquence SSE avec tool_calls (format OpenAI)
        const sseChunks = [
          'data: {"id":"chatcmpl-tc","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","reasoning_content":"Je vais créer..."},"finish_reason":null}]}\n\n',
          'data: {"id":"chatcmpl-tc","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"call_abc","type":"function","function":{"name":"create_organization","arguments":""}}]},"finish_reason":null}]}\n\n',
          'data: {"id":"chatcmpl-tc","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"{\\"name\\":\\"}}]},"finish_reason":null}]}\n\n',
          'data: {"id":"chatcmpl-tc","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"\\"Collège Jean-Moulin\\",\\"type\\":\\"SCO\\""}}]},"finish_reason":null}]}\n\n',
          'data: {"id":"chatcmpl-tc","object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"tool_calls"}]}\n\n',
          'data: [DONE]\n\n',
        ];

        const { port, close } = await startFakeInferenceServer(sseChunks);
        config.llmAssistant.inferenceUrl = `http://127.0.0.1:${port}`;

        try {
          // when
          const stream = await streamConversationTurn({ messages, authorizationHeader });

          // then
          expect(stream).to.be.instanceOf(ReadableStream);

          const parts = [];
          const decoder = new TextDecoder();
          for await (const chunk of stream) {
            parts.push(decoder.decode(chunk));
          }
          await waitForStreamFinalizationToBeDone();

          const fullResponse = parts.join('');
          expect(fullResponse).to.not.be.empty;
        } finally {
          await close();
        }
      });
    });
  });
});
