import { CertificationCourseRejected } from '../../../../../lib/domain/events/CertificationCourseRejected.js';
import { CertificationCourseUnrejected } from '../../../../../lib/domain/events/CertificationCourseUnrejected.js';
import { usecases as libUsecases } from '../../../../../lib/domain/usecases/index.js';
import { certificationCourseController } from '../../../../../src/certification/session-management/application/certification-course-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Session Management | Unit | Application | Controller | Certification Course', function () {
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

  describe('#update', function () {
    let certificationSerializer;
    const options = {
      method: 'PATCH',
      url: '/api/certification-courses/1245',
      params: {
        id: 4,
      },
      auth: {
        credentials: {
          userId: 54,
        },
      },
      payload: {
        data: {
          type: 'certifications',
          attributes: {
            id: '1',
            firstName: 'Phil',
            lastName: 'Defer',
            birthplace: 'Not here nor there',
            birthdate: '2020-01-01',
            status: 'rejected',
            birthCountry: 'Kazakhstan',
            birthINSEECode: '99505',
            birthPostalCode: '12345',
            sex: 'M',
          },
        },
      },
    };

    beforeEach(function () {
      certificationSerializer = {
        serializeFromCertificationCourse: sinon.stub(),
        deserializeCertificationCandidateModificationCommand: sinon.stub(),
        deserialize: sinon.stub(),
      };
    });

    it('should modify the certification course candidate ', async function () {
      // given
      sinon.stub(usecases, 'correctCandidateIdentityInCertificationCourse').resolves();
      const updatedCertificationCourse = domainBuilder.buildCertificationCourse();
      sinon.stub(libUsecases, 'getCertificationCourse').resolves(updatedCertificationCourse);
      certificationSerializer.deserializeCertificationCandidateModificationCommand.resolves({
        firstName: 'Phil',
        lastName: 'Defer',
        birthplace: 'Not here nor there',
        birthdate: '2020-01-01',
        userId: 54,
        certificationCourseId: 4,
        birthCountry: 'Kazakhstan',
        birthPostalCode: '12345',
        sex: 'M',
        birthINSEECode: '99505',
      });
      certificationSerializer.serializeFromCertificationCourse.returns('ok');

      // when
      await certificationCourseController.update(options, hFake, { certificationSerializer });

      // then
      expect(usecases.correctCandidateIdentityInCertificationCourse).to.have.been.calledWithExactly({
        command: {
          firstName: 'Phil',
          lastName: 'Defer',
          birthplace: 'Not here nor there',
          birthdate: '2020-01-01',
          userId: 54,
          certificationCourseId: 4,
          birthCountry: 'Kazakhstan',
          birthPostalCode: '12345',
          sex: 'M',
          birthINSEECode: '99505',
        },
      });
    });

    context('when certification course was modified', function () {
      it('should serialize and return saved certification course', async function () {
        // given
        sinon.stub(usecases, 'correctCandidateIdentityInCertificationCourse').resolves();
        const updatedCertificationCourse = domainBuilder.buildCertificationCourse();
        sinon.stub(libUsecases, 'getCertificationCourse').resolves(updatedCertificationCourse);
        certificationSerializer.deserializeCertificationCandidateModificationCommand.resolves({
          firstName: 'Phil',
          lastName: 'Defer',
          birthplace: 'Not here nor there',
          birthdate: '2020-01-01',
          userId: 54,
          certificationCourseId: 4,
          birthCountry: 'Kazakhstan',
          birthPostalCode: '12345',
          sex: 'M',
          birthINSEECode: '99505',
        });
        certificationSerializer.serializeFromCertificationCourse.returns('ok');

        // when
        const response = await certificationCourseController.update(options, hFake, { certificationSerializer });

        // then
        expect(response).to.deep.equal('ok');
      });
    });
  });
});
