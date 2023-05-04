import { AssessmentEndedError } from '../errors.js';

const getNextChallengeForPreview = function () {
  return Promise.reject(new AssessmentEndedError());
};

export { getNextChallengeForPreview };
