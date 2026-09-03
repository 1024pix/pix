import { Readable } from 'node:stream';

import { usecases } from '../domain/usecases/index.js';

const postMessage = async function (request, h) {
  const messages = request.payload.messages;
  const clientTools = request.payload.tools ?? {};
  const documentContext = request.payload.documentContext ?? null;
  const authorizationHeader = request.headers.authorization;
  const forwardedHeaders = {
    'x-forwarded-proto': request.headers['x-forwarded-proto'],
    'x-forwarded-host': request.headers['x-forwarded-host'],
  };
  const apiBaseUrl = request.server.info.uri;

  try {
    const stream = await usecases.converse({ messages, clientTools, documentContext, authorizationHeader, forwardedHeaders, apiBaseUrl });
    return h.response(Readable.fromWeb(stream)).type('text/event-stream');
  } catch (err) {
    request.log(['error', 'llm-assistant'], { message: err.message, stack: err.stack, cause: err.cause?.message });
    throw err;
  }
};

export const conversationController = { postMessage };
