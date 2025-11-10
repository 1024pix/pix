import { PassThrough, pipeline } from 'node:stream';

import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import * as events from './transforms/events.js';
import * as lengthPrefixedJsonDecoderTransform from './transforms/length-prefixed-json-decoder-transform.js';
import * as responseObjectToEventStreamTransform from './transforms/response-object-to-event-stream-transform.js';
import * as sendDebugDataTransform from './transforms/send-debug-data-transform.js';
import * as sendUserPromptsLeftTransform from './transforms/send-user-prompts-left-transform.js';

const logger = child('llm:api', { event: SCOPES.LLM });

export const ATTACHMENT_MESSAGE_TYPES = {
  NONE: 'NONE',
  IS_VALID: 'IS_VALID',
  IS_INVALID: 'IS_INVALID',
};

/**
 * @typedef {Object} StreamCapture
 * @property {string[]} LLMMessageParts - Accumulated message chunks.
 * @property {boolean=} haveVictoryConditionsBeenFulfilled - Whether victory conditions were fulfilled during this exchange or not
 * @property {number} inputTokens
 * @property {number} outputTokens
 * @property {boolean} wasModerated
 * @property {string=} errorOccurredDuringStream
 * @property {boolean} done - Indicates whether all data have been received from ChatPix or not
 */

/**
 * @callback OnStreamDoneCallback
 * @param {StreamCapture} streamCapture
 * @param {boolean} hasStreamSucceeded
 */

/**
 * @function
 * @name fromLLMResponse
 *
 * @param {Object} params
 * @param {ReadableStream|null} params.llmResponse
 * @param {OnStreamDoneCallback} params.onStreamDone
 * @param {string} params.attachmentMessageType
 * @param {boolean} params.shouldSendDebugData
 * @param {string} params.prompt
 * @param {number} params.userPromptsLeft
 * @returns {Promise<module:stream.internal.PassThrough>}
 */
export async function fromLLMResponse({
  llmResponse,
  onStreamDone,
  attachmentMessageType,
  shouldSendDebugData,
  prompt,
  userPromptsLeft,
}) {
  const writableStream = new PassThrough();
  writableStream.on('error', (err) => {
    logger.warn({ err, prompt }, 'error while streaming response');
  });
  if (attachmentMessageType !== ATTACHMENT_MESSAGE_TYPES.NONE) {
    writableStream.write(events.getAttachmentMessage(attachmentMessageType === ATTACHMENT_MESSAGE_TYPES.IS_VALID));
  }
  const readableStream = llmResponse ?? emptyReadable();
  /** @type {StreamCapture} */
  const streamCapture = {
    LLMMessageParts: [],
    haveVictoryConditionsBeenFulfilled: undefined,
    inputTokens: 0,
    outputTokens: 0,
    wasModerated: false,
    done: !llmResponse,
  };
  pipeline(
    readableStream,
    lengthPrefixedJsonDecoderTransform.getTransform(),
    responseObjectToEventStreamTransform.getTransform(streamCapture),
    sendUserPromptsLeftTransform.getTransform(streamCapture, userPromptsLeft),
    sendDebugDataTransform.getTransform(streamCapture, shouldSendDebugData),
    writableStream,
    async (err) => {
      if (err || !streamCapture.done || streamCapture.errorOccurredDuringStream) {
        logger.warn({ err: err ?? streamCapture.errorOccurredDuringStream, prompt }, 'error in stream');
      }
      await onStreamDone(streamCapture, !err);
    },
  );
  return writableStream;
}

function emptyReadable() {
  const readableStream = new PassThrough();
  readableStream.end();
  return readableStream;
}
