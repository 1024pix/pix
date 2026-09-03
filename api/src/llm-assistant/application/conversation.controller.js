import { PassThrough, Readable } from 'node:stream';

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
  try {
    const stream = await usecases.converse({ messages, clientTools, documentContext, authorizationHeader, forwardedHeaders });
    const readable = Readable.fromWeb(stream);
    const safe = new PassThrough();

    // Send SSE comment pings every 20s to prevent Scalingo's idle connection
    // timeout from dropping the stream while the model is reasoning silently.
    const keepalive = setInterval(() => { if (!safe.destroyed) safe.write(': ping\n\n'); }, 20_000);
    const stopKeepalive = () => clearInterval(keepalive);

    // Absorb stream errors so Hapi never tries to set headers on an already-started
    // SSE response (which throws ERR_HTTP_HEADERS_SENT and crashes the process).
    readable.on('error', (err) => {
      request.log(['error', 'llm-assistant'], { message: err.message, stack: err.stack });
      stopKeepalive();
      safe.end();
    });
    readable.on('end', stopKeepalive);
    readable.on('close', stopKeepalive);
    readable.pipe(safe);
    return h.response(safe).type('text/event-stream');
  } catch (err) {
    request.log(['error', 'llm-assistant'], { message: err.message, stack: err.stack, cause: err.cause?.message });
    throw err;
  }
};

export const conversationController = { postMessage };
