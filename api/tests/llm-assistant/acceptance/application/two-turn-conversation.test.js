import http from 'node:http';

import nock from 'nock';

import { createServer } from '../../../../server.js';
import { config } from '../../../../src/shared/config.js';
import { ORGANIZATION_FEATURE } from '../../../../src/shared/constants.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

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

/**
 * Chunks SSE OpenAI-compatible pour un tool call create_organization.
 * L'AI SDK (@ai-sdk/openai) parse ces chunks et génère un stream UI.
 */
function makeToolCallSseChunks(toolCallId, toolName, toolArgs) {
  const argsJson = JSON.stringify(toolArgs);
  return [
    `data: {"id":"chatcmpl-tc","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","tool_calls":[{"index":0,"id":"${toolCallId}","type":"function","function":{"name":"${toolName}","arguments":""}}]},"finish_reason":null}]}\n\n`,
    `data: {"id":"chatcmpl-tc","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":${JSON.stringify(argsJson)}}}]},"finish_reason":null}]}\n\n`,
    `data: {"id":"chatcmpl-tc","object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"tool_calls"}]}\n\n`,
    'data: [DONE]\n\n',
  ];
}

/**
 * Chunks SSE OpenAI-compatible pour une réponse textuelle simple.
 */
function makeTextSseChunks(text) {
  return [
    `data: {"id":"chatcmpl-txt","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant","content":"${text}"},"finish_reason":null}]}\n\n`,
    'data: {"id":"chatcmpl-txt","object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n',
    'data: [DONE]\n\n',
  ];
}

describe('Acceptance | LlmAssistant | Application | Route | TwoTurnConversation', function () {
  let httpServer;
  let fakeInferenceServer;
  let originalInferenceUrl;
  let originalBaseUrl;
  let superAdmin;
  let authHeaders;
  let administrationTeam;
  let organizationLearnerType;

  beforeEach(async function () {
    originalInferenceUrl = config.llmAssistant.inferenceUrl;
    originalBaseUrl = config.baseUrl;

    superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
    databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT);
    administrationTeam = databaseBuilder.factory.buildAdministrationTeam({ name: 'Équipe LLM Test' });
    organizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({ name: 'Apprenants LLM Test' });
    databaseBuilder.factory.buildCertificationCpfCountry({ code: 99100, commonName: 'France', originalName: 'France' });
    await databaseBuilder.commit();

    httpServer = await createServer();
    await httpServer.start();
    config.baseUrl = `http://localhost:${httpServer.info.port}`;
    nock.enableNetConnect();

    authHeaders = generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id });
  });

  afterEach(async function () {
    config.baseUrl = originalBaseUrl;
    config.llmAssistant.inferenceUrl = originalInferenceUrl;
    nock.disableNetConnect();
    nock.enableNetConnect('localhost:9090');

    if (fakeInferenceServer) {
      await fakeInferenceServer.close();
      fakeInferenceServer = null;
    }

    await httpServer.stop({ timeout: 0 });
  });

  describe('Two-turn conversation: tool call → execution → final response → cancellation', function () {
    // ─────────────────────────────────────────────────────────────────────
    // Étape 1 : le LLM demande à créer une organisation via tool call
    // ─────────────────────────────────────────────────────────────────────
    it('step 1 — POST /conversations/messages returns SSE flux containing create_organization tool call', async function () {
      // given
      const toolCallId = 'call_abc123';
      const toolArgs = {
        name: 'Organisation LLM',
        type: 'PRO',
        administrationTeamName: administrationTeam.name,
        organizationLearnerTypeName: organizationLearnerType.name,
        countryName: 'France',
      };
      const sseChunks = makeToolCallSseChunks(toolCallId, 'create_organization', toolArgs);

      fakeInferenceServer = await startFakeInferenceServer(sseChunks);
      config.llmAssistant.inferenceUrl = `http://127.0.0.1:${fakeInferenceServer.port}`;

      // when
      const response = await httpServer.inject({
        method: 'POST',
        url: '/api/admin/llm-assistant/conversations/messages',
        headers: authHeaders,
        payload: {
          messages: [{ role: 'user', content: 'Crée une organisation PRO nommée Organisation LLM' }],
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-type']).to.include('text/event-stream');
      expect(response.payload).to.include('create_organization');
    });

    // ─────────────────────────────────────────────────────────────────────
    // Étape 2 : exécution de l'outil — persistance en base avec createdBy
    // ─────────────────────────────────────────────────────────────────────
    it('step 2 — POST /tools/create_organization creates org in DB with createdBy = superAdmin.id', async function () {
      // when
      const response = await httpServer.inject({
        method: 'POST',
        url: '/api/admin/llm-assistant/tools/create_organization',
        headers: authHeaders,
        payload: {
          name: 'Organisation LLM Exec',
          type: 'PRO',
          administrationTeamName: administrationTeam.name,
          organizationLearnerTypeName: organizationLearnerType.name,
          countryName: 'France',
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
      const data = JSON.parse(response.payload);
      expect(data).to.have.property('id');
      expect(data).to.have.property('name', 'Organisation LLM Exec');

      const orgs = await knex('organizations').where({ name: 'Organisation LLM Exec' });
      expect(orgs).to.have.lengthOf(1);
      expect(orgs[0]).to.deep.include({
        name: 'Organisation LLM Exec',
        type: 'PRO',
        createdBy: superAdmin.id,
        administrationTeamId: administrationTeam.id,
        organizationLearnerTypeId: organizationLearnerType.id,
      });
    });

    // ─────────────────────────────────────────────────────────────────────
    // Étape 3 : second tour — LLM répond avec le résultat de l'outil dans l'historique
    // ─────────────────────────────────────────────────────────────────────
    it('step 3 — POST /conversations/messages with tool result in history returns SSE text response', async function () {
      // given — réponse textuelle confirmant la création
      const sseChunks = makeTextSseChunks('Organisation créée avec succès !');
      fakeInferenceServer = await startFakeInferenceServer(sseChunks);
      config.llmAssistant.inferenceUrl = `http://127.0.0.1:${fakeInferenceServer.port}`;

      // Historique incluant le tool call de l'assistant et le résultat de l'outil
      const toolCallId = 'call_abc123';
      const messagesWithToolResult = [
        { role: 'user', content: 'Crée une organisation PRO nommée Organisation LLM' },
        {
          role: 'assistant',
          content: [
            {
              type: 'tool-call',
              toolCallId,
              toolName: 'create_organization',
              input: {
                name: 'Organisation LLM',
                type: 'PRO',
                administrationTeamName: administrationTeam.name,
                organizationLearnerTypeName: organizationLearnerType.name,
                countryName: 'France',
              },
            },
          ],
        },
        {
          role: 'tool',
          content: [
            {
              type: 'tool-result',
              toolCallId,
              toolName: 'create_organization',
              output: { type: 'text', value: JSON.stringify({ id: 42, name: 'Organisation LLM' }) },
            },
          ],
        },
      ];

      // when
      const response = await httpServer.inject({
        method: 'POST',
        url: '/api/admin/llm-assistant/conversations/messages',
        headers: authHeaders,
        payload: { messages: messagesWithToolResult },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-type']).to.include('text/event-stream');
      expect(response.payload).to.not.be.empty;
    });

    // ─────────────────────────────────────────────────────────────────────
    // Étape 4 : tour de refus — { error: 'cancelled' } dans l'historique
    // ─────────────────────────────────────────────────────────────────────
    it('step 4 — POST /conversations/messages with cancellation in history returns SSE text response', async function () {
      // given — le LLM répond à l'annulation par un message texte
      const sseChunks = makeTextSseChunks("D'accord, j'ai annulé la création de l'organisation.");
      fakeInferenceServer = await startFakeInferenceServer(sseChunks);
      config.llmAssistant.inferenceUrl = `http://127.0.0.1:${fakeInferenceServer.port}`;

      // Historique incluant un résultat d'outil annulé
      const toolCallId = 'call_xyz789';
      const messagesWithCancellation = [
        { role: 'user', content: 'Crée une organisation PRO nommée Organisation Annulée' },
        {
          role: 'assistant',
          content: [
            {
              type: 'tool-call',
              toolCallId,
              toolName: 'create_organization',
              input: {
                name: 'Organisation Annulée',
                type: 'PRO',
                administrationTeamName: administrationTeam.name,
                organizationLearnerTypeName: organizationLearnerType.name,
                countryName: 'France',
              },
            },
          ],
        },
        {
          role: 'tool',
          content: [
            {
              type: 'tool-result',
              toolCallId,
              toolName: 'create_organization',
              output: { type: 'text', value: JSON.stringify({ error: 'cancelled' }) },
            },
          ],
        },
      ];

      // when
      const response = await httpServer.inject({
        method: 'POST',
        url: '/api/admin/llm-assistant/conversations/messages',
        headers: authHeaders,
        payload: { messages: messagesWithCancellation },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-type']).to.include('text/event-stream');
      expect(response.payload).to.not.be.empty;
    });
  });
});
