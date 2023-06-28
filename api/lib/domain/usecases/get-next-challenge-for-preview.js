import { AssessmentEndedError } from '../../../src/shared/domain/errors.js';

const getNextChallengeForPreview = function () {
  return Promise.reject(new AssessmentEndedError());
};

export { getNextChallengeForPreview };
