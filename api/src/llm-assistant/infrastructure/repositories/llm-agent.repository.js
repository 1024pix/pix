import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, dynamicTool, extractReasoningMiddleware, jsonSchema, streamText, wrapLanguageModel } from 'ai';

import { config } from '../../../shared/config.js';
import { createMcpClient } from '../mcp/mcp-client.js';

/**
 * Wraps fetch to convert reasoning_content SSE deltas into <think>…</think> tags
 * so that extractReasoningMiddleware can pick them up.
 * Some OpenAI-compatible inference servers (Qwen/QwQ via vLLM) emit reasoning_content
 * instead of embedding <think> tags in the content field.
 */
function createReasoningFetch() {
  return async (url, init) => {
    const response = await globalThis.fetch(url, init);
    const contentType = response.headers.get('content-type') ?? '';
    if (!response.body || !contentType.includes('text/event-stream')) {
      return response;
    }

    let thinkOpen = false;
    let buf = '';

    const transformedBody = response.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            buf += chunk;
            const lines = buf.split('\n');
            buf = lines.pop() ?? '';
            const out = [];
            for (const line of lines) {
              if (!line.startsWith('data: ') || line === 'data: [DONE]') {
                out.push(line);
                continue;
              }
              try {
                const parsed = JSON.parse(line.slice(6));
                const delta = parsed?.choices?.[0]?.delta;
                if (!delta) {
                  out.push(line);
                  continue;
                }
                // Scaleway Serverless Inference uses delta.reasoning (not delta.reasoning_content)
                const rc = delta.reasoning ?? delta.reasoning_content;
                if (rc) {
                  delta.content = (thinkOpen ? '' : '<think>') + rc;
                  thinkOpen = true;
                  delete delta.reasoning;
                  delete delta.reasoning_content;
                  out.push('data: ' + JSON.stringify(parsed));
                } else if (thinkOpen) {
                  thinkOpen = false;
                  delta.content = '</think>' + (delta.content ?? '');
                  out.push('data: ' + JSON.stringify(parsed));
                } else {
                  out.push(line);
                }
              } catch {
                out.push(line);
              }
            }
            controller.enqueue(out.join('\n') + '\n');
          },
          flush(controller) {
            if (buf) controller.enqueue(buf);
          },
        }),
      )
      .pipeThrough(new TextEncoderStream());

    return new Response(transformedBody, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  };
}

// Fonction (et non constante) pour que la date soit recalculée à chaque appel.
function getSystemPrompt() {
  return `Tu es un assistant pour les équipes de Pix backoffice.
Tu les aides à réaliser des opérations complexes via le langage naturel.
Toute action générée par le LLM nécessite une approbation humaine explicite avant d'être exécutée.
Date du jour : ${new Date().toISOString().slice(0, 10)}.

RÈGLE ABSOLUE : appelle les outils directement, sans jamais écrire de message préliminaire d'annonce. N'écris pas "Je vais faire X" — fais-le.

Lorsqu'un document est joint ([Document:] suivi d'une ligne "documentId: XXX") :
1. Appelle immédiatement \`run_script\` avec un script de simulation : pour chaque ligne de données, \`await tools.call("create_organization", { ...args, simulate: true }, { ligne: i + 1 })\`.
2. \`run_script\` retourne un résumé de simulation : nombre de lignes prêtes, erreurs, doublons, détail par ligne.
3. Résume les résultats à l'utilisateur. Si des erreurs ou doublons existent, explique-les clairement et demande à l'utilisateur s'il veut exclure ces lignes ou fournir des corrections. **STOP — attends la réponse de l'utilisateur avant toute autre action.**
4. Si l'utilisateur confirme (après avoir éventuellement exclu des lignes via le bouton), appelle \`approve_lot({ documentId })\` pour créer les organisations.

Après la simulation : résume les résultats, explique les erreurs, et **STOP — attends la réponse de l'utilisateur** avant toute autre action.

Dans les scripts run_script :
- Utilise TOUJOURS \`await tools.call(...)\` dans une boucle \`for\` — JAMAIS \`.map()\`, \`forEach\` ou \`Promise.all\` (les Promises non-résolues ne peuvent pas être clonées).
- `sheets[0]` est un tableau JS de tableaux JS. Chaque ligne est DÉJÀ un tableau : utilise `row[0]`, `row[1]`… Ne fais JAMAIS `row.split()` ni aucune transformation.
- Utilise TOUJOURS les valeurs brutes (row[N]) comme arguments — ne les traduis JAMAIS.
- \`const rows = sheets[0];\` pour accéder aux lignes (ne rebinde jamais \`sheets\`).
- \`{ ligne: i + 1 }\` dans \`tools.call\`, jamais le contenu de la ligne.
N'appelle \`list_reference_values\` qu'en cas d'erreur pour aider à corriger une valeur.`;
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
 * @param {Record<string, object>} params.clientTools - Tools côté client envoyés par AssistantChatTransport
 * @param {string} params.authorizationHeader - Header Authorization de la requête entrante
 * @returns {Promise<ReadableStream>} Flux SSE UI stream
 */
const streamConversationTurn = async function ({ messages, clientTools = {}, documentContext = null, authorizationHeader, forwardedHeaders, serverPort }) {
  const inferenceProvider = createOpenAI({
    baseURL: config.llmAssistant.baseUrl,
    apiKey: config.llmAssistant.apiKey,
    fetch: createReasoningFetch(),
  });

  // Wrap with extractReasoningMiddleware so <think> blocks in the content are
  // converted to reasoning parts instead of being stripped by DOMPurify on the client.
  const model = wrapLanguageModel({
    model: inferenceProvider.chat(config.llmAssistant.model),
    middleware: extractReasoningMiddleware({ tagName: 'think' }),
  });

  // Use loopback + actual bound port (not 0.0.0.0) to avoid Scalingo's load balancer
  // overwriting x-forwarded-host, which would break JWT audience validation.
  const loopbackBaseUrl = `http://127.0.0.1:${serverPort}`;
  const mcpClient = await createMcpClient({
    authorizationHeader,
    forwardedHeaders,
    apiBaseUrl: loopbackBaseUrl,
  });

  // Récupération et conversion des tools MCP en DynamicTool AI SDK (déclaratifs)
  // puis fusion avec les tools client (envoyés par AssistantChatTransport).
  // clientTools vient du body sous forme { toolName: { description, parameters } } —
  // il faut les convertir en dynamicTool avant de les passer à streamText.
  const { tools: mcpTools } = await mcpClient.listTools();
  // Close immediately — we only needed the tool schemas. Leaving it open keeps
  // a SSE GET connection alive that can error 30+ seconds later and crash Hapi.
  await mcpClient.close();
  const convertedClientTools = {};
  for (const [name, schema] of Object.entries(clientTools)) {
    convertedClientTools[name] = dynamicTool({
      description: schema.description,
      inputSchema: jsonSchema(schema.parameters ?? {}),
    });
  }
  const tools = { ...buildToolsFromMcp(mcpTools), ...convertedClientTools };

  // Conversion des UIMessages en ModelMessages (pour les tours 2+, avec résultats de tools).
  // Les UIMessage ont un champ `parts` ; les ModelMessage ont `content`.
  // On ne convertit que si le premier message est un UIMessage.
  const isUiMessages = messages.length > 0 && Array.isArray(messages[0].parts);
  const rawModelMessages = isUiMessages ? await convertToModelMessages(messages, { tools }) : messages;

  // Garde au maximum 20 messages pour éviter de saturer le contexte LLM.
  // On tronque depuis le début mais on garantit toujours au moins un message 'user' :
  // - si la fenêtre commence au milieu d'un tour, on remonte au premier 'user' dans la fenêtre
  // - si la fenêtre ne contient aucun 'user' (outil en cascade très long), on préfixe le
  //   dernier 'user' trouvé avant la fenêtre — Qwen rejette sinon avec "No user query found".
  const MAX_MESSAGES = 20;
  let modelMessages = rawModelMessages;
  if (rawModelMessages.length > MAX_MESSAGES) {
    const truncated = rawModelMessages.slice(-MAX_MESSAGES);
    const firstUserIdx = truncated.findIndex((m) => m.role === 'user');
    if (firstUserIdx > 0) {
      modelMessages = truncated.slice(firstUserIdx);
    } else if (firstUserIdx === -1) {
      const beforeWindow = rawModelMessages.slice(0, -MAX_MESSAGES);
      const lastUserBeforeWindow = beforeWindow.findLastIndex((m) => m.role === 'user');
      modelMessages = lastUserBeforeWindow >= 0 ? [beforeWindow[lastUserBeforeWindow], ...truncated] : truncated;
    } else {
      modelMessages = truncated;
    }
  }

  // Injecter le contexte document dans le dernier message user (après conversion pour éviter
  // que convertToModelMessages ne l'ignore).
  if (documentContext) {
    const lastUserIdx = modelMessages.reduce((acc, msg, i) => (msg.role === 'user' ? i : acc), -1);
    if (lastUserIdx >= 0) {
      const orig = modelMessages[lastUserIdx];
      const existingContent = Array.isArray(orig.content)
        ? orig.content
        : [{ type: 'text', text: String(orig.content ?? '') }];
      modelMessages = [
        ...modelMessages.slice(0, lastUserIdx),
        { ...orig, content: [{ type: 'text', text: documentContext }, ...existingContent] },
        ...modelMessages.slice(lastUserIdx + 1),
      ];
    }
  }

  const result = streamText({
    model,
    system: getSystemPrompt(),
    messages: modelMessages,
    tools,
    temperature: 0.6,
    topP: 0.95,
    maxTokens: 32768,
    experimental_telemetry: { isEnabled: false },
  });

  return result.toUIMessageStreamResponse({ sendReasoning: true }).body;
};

export { buildToolsFromMcp,getSystemPrompt, streamConversationTurn };
