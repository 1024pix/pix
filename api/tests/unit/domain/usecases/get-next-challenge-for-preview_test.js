import { expect } from '../../../test-helper.js';
import { getNextChallengeForPreview } from '../../../../lib/domain/usecases/get-next-challenge-for-preview.js';
import { AssessmentEndedError } from '../../../../lib/domain/errors.js';

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
