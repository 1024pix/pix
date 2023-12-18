import { usecases } from '../../../../../src/certification/shared/domain/usecases/index.js';
import { certificationCourseController } from '../../../../../src/certification/course/application/certification-course-controller.js';
import { sinon, hFake, expect } from '../../../../test-helper.js';
import { CertificationCourseRejected } from '../../../../../lib/domain/events/CertificationCourseRejected.js';
import { CertificationCourseUnrejected } from '../../../../../lib/domain/events/CertificationCourseUnrejected.js';
import { AssessmentResult } from '../../../../../src/shared/domain/models/AssessmentResult.js';

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

  describe('#updateJuryComments', function () {
    it('should updateJuryComments usecase', async function () {
      // given
      const assessmentResultSerializer = {
        deserialize: sinon.stub(),
      };
      sinon.stub(usecases, 'updateJuryComments');
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
              'assessment-id': 1,
              'pix-score': 300,
              status: 'validated',
              emitter: 'Jury Pix',
              'comment-for-jury': 'Tell',
              'comment-for-candidate': 'Me',
              'comment-for-organization': 'Why',
            },
          },
        },
      };
      const assessmentResult = new AssessmentResult({
        assessmentId: 1,
        emitter: 'Jury Pix',
        commentForJury: 'Tell',
        commentForCandidate: 'Me',
        commentForOrganization: 'Why',
        pixScore: 300,
        status: 'validated',
      });
      assessmentResultSerializer.deserialize.withArgs(request.payload).resolves(assessmentResult);
      usecases.updateJuryComments.resolves();

      // when
      await certificationCourseController.updateJuryComments(request, hFake);

      // then
      expect(usecases.updateJuryComments).to.have.been.calledWithExactly({
        certificationCourseId: 123,
        assessmentResult: { ...assessmentResult, juryId: 789 },
      });
    });
  });
});
