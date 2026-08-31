import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, dynamicTool, jsonSchema, streamText } from 'ai';

import { config } from '../../../shared/config.js';
import { createMcpClient } from '../mcp/mcp-client.js';

// Fonction (et non constante) pour que la date soit recalculée à chaque appel.
function getSystemPrompt() {
  return `Tu es un assistant pour les équipes de Pix backoffice.
Tu les aides à réaliser des opérations complexes via le langage naturel.
Toute action générée par le LLM nécessite une approbation humaine explicite avant d'être exécutée.
Date du jour : ${new Date().toISOString().slice(0, 10)}.`;
}

/**
 * Convertit les tools MCP en DynamicTool déclaratifs (sans execute).
 * Le LLM connaît les schemas ; c'est le client (frontend) qui exécute.
 *
 * @param {Array<{name: string, description?: string, inputSchema: object}>} mcpTools
 * @returns {Record<string, import('ai').DynamicTool>}
 */
function buildToolsFromMcp(mcpTools) {
  const tools = {};
  for (const mcpTool of mcpTools) {
    tools[mcpTool.name] = dynamicTool({
      description: mcpTool.description,
      inputSchema: jsonSchema(mcpTool.inputSchema),
    });
  }
  return tools;
}

/**
 * Diffuse un tour de conversation vers le modèle LLM et retourne le flux SSE UI.
 *
 * @param {Object} params
 * @param {Array} params.messages - Messages au format UIMessage ou ModelMessage
 * @param {string} params.authorizationHeader - Header Authorization de la requête entrante
 * @returns {Promise<ReadableStream>} Flux SSE UI stream
 */
const streamConversationTurn = async function ({ messages, authorizationHeader, forwardedHeaders }) {
  const inferenceProvider = createOpenAI({
    name: 'snotra',
    baseURL: config.llmAssistant.inferenceUrl,
    apiKey: 'not-used',
    headers: {
      'CF-Access-Client-Id': config.llmAssistant.inferenceClientId,
      'CF-Access-Client-Secret': config.llmAssistant.inferenceClientSecret,
    },
  });

  // Utilise .chat() pour cibler l'endpoint /chat/completions (compatible OpenAI)
  const model = inferenceProvider.chat('default');

  // Connexion au serveur MCP (endpoint /api/admin/llm-assistant/mcp de l'API courante)
  const mcpClient = await createMcpClient({
    authorizationHeader,
    forwardedHeaders,
    apiBaseUrl: config.baseUrl,
  });

  // Récupération et conversion des tools MCP en DynamicTool AI SDK (déclaratifs)
  const { tools: mcpTools } = await mcpClient.listTools();
  const tools = buildToolsFromMcp(mcpTools);

  // Conversion des UIMessages en ModelMessages (pour les tours 2+, avec résultats de tools).
  // Les UIMessage ont un champ `parts` ; les ModelMessage ont `content`.
  // On ne convertit que si le premier message est un UIMessage.
  const isUiMessages = messages.length > 0 && Array.isArray(messages[0].parts);
  const modelMessages = isUiMessages ? await convertToModelMessages(messages, { tools }) : messages;

  const result = streamText({
    model,
    system: getSystemPrompt(),
    messages: modelMessages,
    tools,
    experimental_telemetry: { isEnabled: false },
  });

  return result.toUIMessageStreamResponse().body;
};

export { buildToolsFromMcp,getSystemPrompt, streamConversationTurn };
