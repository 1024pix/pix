import { Transform } from 'node:stream';

import * as events from './events.js';

/**
 * @param {StreamCapture} streamCapture Structure that will hold state, such as the accumulated LLM response
 * @returns {Transform}
 */
export function getTransform(streamCapture) {
  return new Transform({
    objectMode: true,
    transform(chunk, _encoding, callback) {
      const { error, message, isValid, usage, wasModerated, ping } = chunk;
      let data = '';

      if (ping) {
        data += events.getPing();
      }

      if (isValid) {
        streamCapture.haveVictoryConditionsBeenFulfilled = true;
        data += events.getVictoryConditionsSuccess();
      }

      if (wasModerated) {
        streamCapture.wasModerated = true;
        data += events.getMessageModerated();
      }

      if (message) {
        streamCapture.LLMMessageParts.push(...message.split(''));
        data += getFormattedMessage(message);
      }

      if (error) {
        streamCapture.errorOccurredDuringStream = error;
        data += events.getError();
      }

      if (usage) {
        streamCapture.inputTokens = usage?.input_tokens ?? streamCapture.inputTokens;
        streamCapture.outputTokens = usage?.output_tokens ?? streamCapture.outputTokens;
        streamCapture.done = true;
      }

      if (data) callback(null, data);
      else callback();
    },
  });
}

function getFormattedMessage(message) {
  const formattedMessage = message.replaceAll('\n', '\ndata: ');
  return `data: ${formattedMessage}\n\n`;
}
