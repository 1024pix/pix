import { ResultRecipient } from '../../../../../../src/certification/results/domain/read-models/ResultRecipient.js';

export function buildResultRecipient({
  sessionId = 1,
  resultRecipientEmail = 'recipient@example.net',
  candidateIds = [],
} = {}) {
  return new ResultRecipient({ sessionId, resultRecipientEmail, candidateIds });
}
