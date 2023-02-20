import { AssessmentEndedError } from '../errors';

export default function getNextChallengeForPreview() {
  return Promise.reject(new AssessmentEndedError());
}
