import { createRequire } from 'node:module';

import { createOpenAI } from '@ai-sdk/openai';
import { evaluate,Laminar } from '@lmnr-ai/lmnr';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { streamText } from 'ai';
import nock from 'nock';

import { createMcpServer } from '../../src/llm-assistant/infrastructure/mcp/mcp-server.js';
import { buildToolsFromMcp,getSystemPrompt } from '../../src/llm-assistant/infrastructure/repositories/llm-agent.repository.js';
import { config } from '../../src/shared/config.js';
import { noExtraArgs, recoveryFixesInvalidArg, requiredArgsMatch, singleToolCall, toolsAvoided, toolSelectionScore,toolsSelected } from './scorers.js';

const require = createRequire(import.meta.url);
const dataset = require('./dataset.json');

const MOCK_API_BASE_URL = 'http://eval-api.local';

const ENUM_FIXTURES = {
  learnerTypes: [
    { id: '1', type: 'organization-learner-types', attributes: { name: 'Lycéens' } },
    { id: '2', type: 'organization-learner-types', attributes: { name: 'Étudiants' } },
    { id: '3', type: 'organization-learner-types', attributes: { name: 'Salariés' } },
    { id: '4', type: 'organization-learner-types', attributes: { name: 'Adultes en formation' } },
    { id: '5', type: 'organization-learner-types', attributes: { name: 'Collégiens' } },
    { id: '6', type: 'organization-learner-types', attributes: { name: 'Apprentis' } },
  ],
  administrationTeams: [
    { id: '10', type: 'administration-teams', attributes: { name: 'Commercial' } },
    { id: '11', type: 'administration-teams', attributes: { name: 'Partenariats' } },
    { id: '12', type: 'administration-teams', attributes: { name: 'Technique' } },
    { id: '13', type: 'administration-teams', attributes: { name: 'Support' } },
  ],
  countries: [
    { id: '1', type: 'countries', attributes: { name: 'France', code: '99100' } },
    { id: '2', type: 'countries', attributes: { name: 'Belgique', code: '99131' } },
    { id: '3', type: 'countries', attributes: { name: 'Espagne', code: '99134' } },
    { id: '4', type: 'countries', attributes: { name: 'Maroc', code: '99350' } },
    { id: '5', type: 'countries', attributes: { name: 'Allemagne', code: '99109' } },
  ],
};

async function buildMcpTools() {
  nock(MOCK_API_BASE_URL)
    .get('/api/admin/organization-learner-types')
    .reply(200, { data: ENUM_FIXTURES.learnerTypes })
    .get('/api/admin/administration-teams')
    .reply(200, { data: ENUM_FIXTURES.administrationTeams })
    .get('/api/countries')
    .reply(200, { data: ENUM_FIXTURES.countries });

  const mcpServer = await createMcpServer({
    authorizationHeader: 'Bearer eval',
    apiBaseUrl: MOCK_API_BASE_URL,
  });

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await mcpServer.connect(serverTransport);

  const mcpClient = new Client({ name: 'eval', version: '1.0.0' });
  await mcpClient.connect(clientTransport);

  const { tools: mcpTools } = await mcpClient.listTools();
  return buildToolsFromMcp(mcpTools);
}

const LAMINAR_CONFIG = config.llmAssistant.lmnrProjectApiKey
  ? {
      baseUrl: 'http://localhost',
      httpPort: 8000,
      grpcPort: 8001,
      frontendPort: 5667,
    }
  : undefined;

async function main() {
  if (config.llmAssistant.lmnrProjectApiKey) {
    Laminar.initialize({
      projectApiKey: config.llmAssistant.lmnrProjectApiKey,
      ...LAMINAR_CONFIG,
    });
  }

  const tools = await buildMcpTools();

  const inferenceProvider = createOpenAI({
    name: 'snotra',
    baseURL: config.llmAssistant.inferenceUrl,
    apiKey: 'not-used',
    headers: {
      'CF-Access-Client-Id': config.llmAssistant.inferenceClientId,
      'CF-Access-Client-Secret': config.llmAssistant.inferenceClientSecret,
    },
  });
  const model = inferenceProvider.chat('default');

  await evaluate({
    data: dataset,
    executor: async ({ messages }) => {
      const result = streamText({
        model,
        system: getSystemPrompt(),
        messages,
        tools,
        maxSteps: 1,
      });
      const steps = await result.steps;
      const toolCalls = steps.flatMap((s) => s.toolCalls);
      const textOutput = steps.flatMap((s) => s.text).join('').trim();
      return { toolCalls, textOutput };
    },
    evaluators: {
      toolsSelected,
      toolsAvoided,
      requiredArgsMatch,
      singleToolCall,
      recoveryFixesInvalidArg,
      noExtraArgs,
      toolSelectionScore,
    },
    groupName: 'create-organization',
    config: LAMINAR_CONFIG,
  });
}

main().catch(console.error);
