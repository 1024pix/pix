import { repositories } from '../../../../../../src/certification/session-management/infrastructure/repositories/index.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import CertificationCancelled from '../../../../../../src/shared/domain/events/CertificationCancelled.js';
import { catchErr, expect } from '../../../../../test-helper.js';

describe('Integration | Repository | certification-rescoring-repository', function () {
  describe('#rescoreV2Certification', function () {
    it('should trigger a rescoring', async function () {
      // given
      const certificationCancelledEvent = new CertificationCancelled({ certificationCourseId: 444, juryId: 555 });

      // when
      const error = await catchErr(repositories.certificationRescoringRepository.rescoreV2Certification)({
        event: certificationCancelledEvent,
      });

      // then
      expect(error).to.deepEqualInstance(new NotFoundError('Certification course does not exist'));
    });
  });

  describe('#rescoreV3Certification', function () {
    it('should trigger a rescoring', async function () {
      // given
      const certificationCancelledEvent = new CertificationCancelled({ certificationCourseId: 444, juryId: 555 });

      // when
      const error = await catchErr(repositories.certificationRescoringRepository.rescoreV3Certification)({
        event: certificationCancelledEvent,
      });

      // then
      expect(error).to.deepEqualInstance(new NotFoundError('No AssessmentSheet found for certificationCourseId 444'));
    });
  });
});
