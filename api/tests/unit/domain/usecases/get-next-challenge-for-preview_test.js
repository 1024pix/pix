import { expect } from '../../../test-helper';
import getNextChallengeForPreview from '../../../../lib/domain/usecases/get-next-challenge-for-preview';
import { AssessmentEndedError } from '../../../../lib/domain/errors';

describe('Unit | Domain | Use Cases | get-next-challenge-for-preview', function () {
  describe('#getNextChallengeForPreview', function () {
    it('should trigger an AssessmentEndedError', function () {
      // when
      const promise = getNextChallengeForPreview();

      // then
      return expect(promise).to.be.rejectedWith(AssessmentEndedError);
    });
  });
});
