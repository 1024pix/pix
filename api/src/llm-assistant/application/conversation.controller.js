import { Readable } from 'node:stream';

import { usecases } from '../domain/usecases/index.js';

const postMessage = async function (request, h) {
  const messages = request.payload.messages;
  const authorizationHeader = request.headers.authorization;
  const forwardedHeaders = {
    'x-forwarded-proto': request.headers['x-forwarded-proto'],
    'x-forwarded-host': request.headers['x-forwarded-host'],
  };

  const stream = await usecases.converse({ messages, authorizationHeader, forwardedHeaders });

  return h.response(Readable.fromWeb(stream)).type('text/event-stream');
};

export const conversationController = { postMessage };
