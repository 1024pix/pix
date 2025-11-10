import { Transform } from 'node:stream';

/**
 * @param {import ('../to-event-stream').StreamCapture} streamCapture stream metadata
 * @param {number} userPromptsLeft number of prompts the user can still send after the current one
 * @returns {Transform}
 */
export function getTransform(streamCapture, userPromptsLeft) {
  return new Transform({
    objectMode: true,
    transform(chunk, _encoding, callback) {
      callback(null, chunk);
    },
    flush(callback) {
      if (!streamCapture.errorOccurredDuringStream) {
        this.push(getUserPromptsLeftEvent(userPromptsLeft));
      }
      callback();
    },
  });
}

function getUserPromptsLeftEvent(userPromptsLeft) {
  return `event: user-prompts-left\ndata: ${userPromptsLeft}\n\n`;
}
