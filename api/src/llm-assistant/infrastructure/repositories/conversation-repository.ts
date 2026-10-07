import { Readable } from 'node:stream';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';

import { createUIMessageStreamResponse, type ModelMessage, toUIMessageStream } from 'ai';

import { InferenceProviderError } from '../../domain/errors.ts';
import type { Conversation } from '../../domain/models/Conversation.ts';
import type { Message } from '../../domain/models/Message.ts';
import { ask } from '../inference-client.ts';

type StreamParams = {
  conversation: Conversation;
};

function toModelMessage({ role, content }: Message): ModelMessage {
  return { role, content };
}

const stream = async ({ conversation }: StreamParams): Promise<Readable> => {
  const answer = await ask({
    system: conversation.systemPrompt,
    messages: conversation.messages.map(toModelMessage),
  });

  try {
    const { body } = createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: answer }) });

    if (!body) {
      throw new InferenceProviderError('the response carries no body');
    }

    return Readable.fromWeb(body as NodeReadableStream<Uint8Array>);
  } catch (error) {
    await answer.cancel();
    throw error;
  }
};

export { stream };
