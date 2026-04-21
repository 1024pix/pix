import { getNextChallengeForPreview } from '../../../../../src/evaluation/domain/usecases/get-next-challenge-for-preview.js';
import { AssessmentEndedError } from '../../../../../src/shared/domain/errors.js';

describe('Evaluation | Unit | Domain | Use Cases | get-next-challenge-for-preview', function () {
  describe('#getNextChallengeForPreview', function () {
    it('should trigger an AssessmentEndedError', function () {
      // when
      const promise = getNextChallengeForPreview();

      // then
      return expect(promise).to.be.rejectedWith(AssessmentEndedError);
    });
  });
});
