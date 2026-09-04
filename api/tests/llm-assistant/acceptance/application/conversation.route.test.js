import http from 'node:http';

import nock from 'nock';

import { createServer } from '../../../../server.js';
import { config } from '../../../../src/shared/config.js';
import { PIX_ADMIN } from '../../../../src/shared/constants.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { getServer } from '../../../tooling/server/shared-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

const { ROLES } = PIX_ADMIN;

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

describe('Acceptance | LlmAssistant | Application | Route | Conversation', function () {
  let server;

  beforeEach(async function () {
    server = await getServer();
  });

  describe('scenario 1: 401 without token', function () {
    it('returns 401 on POST /api/admin/llm-assistant/conversations/messages without Authorization', async function () {
      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/admin/llm-assistant/conversations/messages',
        payload: { messages: [{ role: 'user', content: 'Bonjour' }] },
      });

      // then
      expect(response.statusCode).to.equal(401);
    });
  });

  describe('scenario 2: 403 with CERTIF role', function () {
    it('returns 403 for a user with the CERTIF role', async function () {
      // given
      const certifUser = databaseBuilder.factory.buildUser.withRole({ role: ROLES.CERTIF });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/admin/llm-assistant/conversations/messages',
        headers: generateAuthenticatedUserRequestHeaders({ userId: certifUser.id }),
        payload: { messages: [{ role: 'user', content: 'Bonjour' }] },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('scenario 3: 200 text/event-stream with fake inference', function () {
    let httpServer;
    let fakeInferenceServer;
    let originalBaseUrl;
    let superAdmin;

    beforeEach(async function () {
      originalBaseUrl = config.llmAssistant.baseUrl;

      superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      databaseBuilder.factory.buildAdministrationTeam({ name: 'Commercial' });
      databaseBuilder.factory.buildOrganizationLearnerType({ name: 'Lycéens' });
      databaseBuilder.factory.buildCertificationCpfCountry({ code: 99100, commonName: 'France', originalName: 'France' });
      await databaseBuilder.commit();

      httpServer = await createServer();
      await httpServer.start();
      // Le serveur utilise request.server.info.port pour la boucle MCP loopback,
      // donc pas besoin de patcher config.port — toutes connexions autorisées.
      nock.enableNetConnect();
    });

    afterEach(async function () {
      config.llmAssistant.baseUrl = originalBaseUrl;
      nock.disableNetConnect();
      nock.enableNetConnect('localhost:9090');

      if (fakeInferenceServer) {
        await fakeInferenceServer.close();
        fakeInferenceServer = null;
      }

      await httpServer.stop({ timeout: 0 });
    });

    it('returns 200 text/event-stream for a SUPER_ADMIN', async function () {
      // given — SSE OpenAI-compatible format (simple text response)
      const sseChunks = [
        'data: {"id":"chatcmpl-1","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":"Bonjour"},"finish_reason":null}]}\n\n',
        'data: {"id":"chatcmpl-1","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"!"},"finish_reason":null}]}\n\n',
        'data: {"id":"chatcmpl-1","object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n',
        'data: [DONE]\n\n',
      ];

      fakeInferenceServer = await startFakeInferenceServer(sseChunks);
      config.llmAssistant.baseUrl = `http://127.0.0.1:${fakeInferenceServer.port}`;

      const headers = generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id });

      // when
      const response = await httpServer.inject({
        method: 'POST',
        url: '/api/admin/llm-assistant/conversations/messages',
        headers,
        payload: { messages: [{ role: 'user', content: 'Bonjour' }] },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-type']).to.include('text/event-stream');
      expect(response.payload).to.not.be.empty;
    });

    it('returns 200 text/event-stream when client tools are included in the payload', async function () {
      // given — SSE OpenAI-compatible format (simple text response)
      const sseChunks = [
        'data: {"id":"chatcmpl-2","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":"Ok"},"finish_reason":null}]}\n\n',
        'data: {"id":"chatcmpl-2","object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n',
        'data: [DONE]\n\n',
      ];

      fakeInferenceServer = await startFakeInferenceServer(sseChunks);
      config.llmAssistant.baseUrl = `http://127.0.0.1:${fakeInferenceServer.port}`;

      const headers = generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id });

      // when
      const response = await httpServer.inject({
        method: 'POST',
        url: '/api/admin/llm-assistant/conversations/messages',
        headers,
        payload: {
          messages: [{ role: 'user', content: 'Exécute le script' }],
          tools: {
            run_script: {
              type: 'function',
              description: 'Exécute un script côté client',
              parameters: { type: 'object', properties: { script: { type: 'string' } }, required: ['script'] },
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-type']).to.include('text/event-stream');
      expect(response.payload).to.not.be.empty;
    });
  });
});
