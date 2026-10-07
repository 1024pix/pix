import { ReadableStream as NodeReadableStream } from 'node:stream/web';

import { createOpenAI } from '@ai-sdk/openai';
import { type ModelMessage, streamText, type TextStreamPart, type ToolSet } from 'ai';

import { config } from '../../../config/config.js';
import { child, SCOPES } from '../../shared/infrastructure/utils/logger.js';
import { InferenceProviderError, InferenceProviderNotConfiguredError } from '../domain/errors.ts';

type Logger = { error: (payload: Record<string, unknown>) => void };

const logger: Logger = child('llm-assistant', { event: SCOPES.LLM }, {}) as Logger;

type Answer = TextStreamPart<ToolSet>;

type AskParams = {
  system: string;
  messages: ModelMessage[];
};

const isRefusal = (piece: Answer) => piece.type === 'error';
const hasStartedAnswering = (piece: Answer) => piece.type !== 'start';

const reportRefusal = (reason: unknown) => logger.error({ err: reason, context: 'llm-assistant-refused' });
const reportInterruption = (reason: unknown) => logger.error({ err: reason, context: 'llm-assistant-interrupted' });

type Opening = {
  alreadyHeard: Answer[];
  rest: AsyncIterator<Answer>;
};

async function listenUntilItAnswers(answer: ReadableStream<Answer>, giveUp: AbortController): Promise<Opening> {
  const pieces = answer[Symbol.asyncIterator]();
  const alreadyHeard: Answer[] = [];

  while (true) {
    const { done, value: piece } = await pieces.next();

    if (done) break;

    if (isRefusal(piece)) {
      giveUp.abort();
      reportRefusal(piece.error);
      throw new InferenceProviderError(String(piece.error));
    }

    alreadyHeard.push(piece);

    if (hasStartedAnswering(piece)) break;
  }

  return { alreadyHeard, rest: pieces };
}

function replayFromTheBeginning({ alreadyHeard, rest }: Opening, giveUp: AbortController): ReadableStream<Answer> {
  async function* wholeAnswer(): AsyncGenerator<Answer> {
    try {
      yield* alreadyHeard;

      for await (const piece of { [Symbol.asyncIterator]: () => rest }) {
        if (isRefusal(piece)) {
          reportInterruption(piece.error);
        }

        yield piece;
      }
    } catch (breakdown) {
      reportInterruption(breakdown);
      throw breakdown;
    } finally {
      giveUp.abort();
    }
  }

  return NodeReadableStream.from(wholeAnswer()) as ReadableStream<Answer>;
}

const ask = async ({ system, messages }: AskParams): Promise<ReadableStream<Answer>> => {
  const { baseUrl, apiKey, model, maxRetries } = config.llmAssistant;

  if (!model) {
    throw new InferenceProviderNotConfiguredError('LLM_ASSISTANT_MODEL');
  }

  const provider = createOpenAI({ baseURL: baseUrl, apiKey });
  const giveUp = new AbortController();

  const answer = streamText({
    model: provider.chat(model),
    system,
    messages,
    maxRetries,
    abortSignal: giveUp.signal,
    onError: () => undefined,
  });

  const opening = await listenUntilItAnswers(answer.stream, giveUp);

  return replayFromTheBeginning(opening, giveUp);
};

export { ask };
