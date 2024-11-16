import { hasBeenCandidate } from '../../../../../../src/certification/enrolment/application/api/candidates-api.js';
import { usecases } from '../../../../../../src/certification/enrolment/domain/usecases/index.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Certification | Enrolment | API | candidates-api', function () {
  describe('hasBeenCandidate', function () {
    it('should check if a user has been candidate', async function () {
      // given
      sinon.stub(usecases, 'hasBeenCandidate').resolves();

      // when
      await hasBeenCandidate({ userId: 12 });

      // then
      expect(usecases.hasBeenCandidate).to.have.been.calledOnceWithExactly({ userId: 12 });
    });

    it('should reject calls without a userId', async function () {
      // given
      sinon.stub(usecases, 'hasBeenCandidate').resolves();

      // when
      const error = await catchErr(() => hasBeenCandidate({ userId: null }))();

      // then
      expect(error).to.be.instanceOf(TypeError);
      expect(error.message).to.equals('user identifier is required');
    });
  });
});
