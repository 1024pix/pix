import { CertificationCourseRejected } from '../../../../../lib/domain/events/CertificationCourseRejected.js';
import { CertificationCourseUnrejected } from '../../../../../lib/domain/events/CertificationCourseUnrejected.js';
import { certificationCourseController } from '../../../../../src/certification/session-management/application/certification-course-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | Certification | session-management | certification-course-controller', function () {
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

  describe('unreject', function () {
    it('should call the unrejectCertificationCourse usecase', async function () {
      const unrejectCertificationCourse = sinon.stub(usecases, 'unrejectCertificationCourse');
      const certificationCourseId = 12;
      const juryId = 456;
      const events = { eventDispatcher: { dispatch: sinon.stub() } };
      const certificationCourseRejectedEvent = new CertificationCourseUnrejected({ certificationCourseId, juryId });
      unrejectCertificationCourse
        .withArgs({ certificationCourseId, juryId })
        .resolves(certificationCourseRejectedEvent);

      const request = {
        params: { id: certificationCourseId },
        auth: {
          credentials: { userId: juryId },
        },
      };

      const response = await certificationCourseController.unreject(request, hFake, { events });

      expect(unrejectCertificationCourse).to.have.been.calledWithExactly({
        certificationCourseId,
        juryId,
      });
      expect(events.eventDispatcher.dispatch).to.have.been.calledWithExactly(certificationCourseRejectedEvent);
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#updateJuryComment', function () {
    it('should updateJuryComment usecase', async function () {
      // given
      sinon.stub(usecases, 'updateJuryComment');
      const request = {
        auth: {
          credentials: {
            userId: 789,
          },
        },
        params: {
          id: 123,
        },
        payload: {
          data: {
            attributes: {
              'comment-by-jury': 'Tell me why',
            },
          },
        },
      };
      usecases.updateJuryComment.resolves();

      // when
      await certificationCourseController.updateJuryComment(request, hFake);

      // then
      expect(usecases.updateJuryComment).to.have.been.calledWithExactly({
        certificationCourseId: 123,
        assessmentResultCommentByJury: 'Tell me why',
        juryId: request.auth.credentials.userId,
      });
    });
  });
});
