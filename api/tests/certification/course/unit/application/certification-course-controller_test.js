import { usecases } from '../../../../../src/certification/shared/domain/usecases/index.js';
import { certificationCourseController } from '../../../../../src/certification/course/application/certification-course-controller.js';
import { sinon, hFake, expect } from '../../../../test-helper.js';
import { CertificationCourseRejected } from '../../../../../lib/domain/events/CertificationCourseRejected.js';

describe('Unit | Controller | certification-course-controller', function () {
  describe('reject', function () {
    it('should call the rejectCertificationCourse usecase', async function () {
      const rejectCertificationCourse = sinon.stub(usecases, 'rejectCertificationCourse');
      const certificationCourseId = 12;
      const juryId = 456;
      const events = { eventDispatcher: { dispatch: sinon.stub() } };
      const certificationCourseRejectedEvent = new CertificationCourseRejected({ certificationCourseId, juryId });
      rejectCertificationCourse.withArgs({ certificationCourseId, juryId }).resolves(certificationCourseRejectedEvent);

      const request = {
        params: { id: certificationCourseId },
        auth: {
          credentials: { userId: juryId },
        },
      };

      const response = await certificationCourseController.reject(request, hFake, { events });

      expect(rejectCertificationCourse).to.have.been.calledWithExactly({
        certificationCourseId,
        juryId,
      });
      expect(events.eventDispatcher.dispatch).to.have.been.calledWithExactly(certificationCourseRejectedEvent);
      expect(response.statusCode).to.equal(200);
    });
  });
});
