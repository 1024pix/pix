import { Transform } from 'node:stream';

/**
 * @param {StreamCapture} streamCapture Structure that will hold state, such as the accumulated LLM response
 * @param {boolean} shouldSendDebugData
 * @returns {Transform}
 */
export function getTransform(streamCapture, shouldSendDebugData) {
  return new Transform({
    objectMode: true,
    transform(chunk, _encoding, callback) {
      callback(null, chunk);
    },
    flush(callback) {
      if (shouldSendDebugData) {
        this.push(getTokenConsumptionEvent(streamCapture.inputTokens, streamCapture.outputTokens));
      }
      callback();
    },
  });
}

function getTokenConsumptionEvent(inputTokens, outputTokens) {
  return (
    'event: debug-input-tokens\ndata: ' +
    inputTokens +
    '\n\n' +
    'event: debug-output-tokens\ndata: ' +
    outputTokens +
    '\n\n'
  );
}
