import { expect } from 'chai';
import sinon from 'sinon';

import { CertificationCourseRejected } from '../../../../../../src/certification/session-management/domain/events/CertificationCourseRejected.js';
import { rejectCertificationCourse } from '../../../../../../src/certification/session-management/domain/usecases/reject-certification-course.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { CertificationCourse } from '../../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | reject-certification-course', function () {
  describe('when certification is a V2', function () {
    it('should reject a newly created assessment result', async function () {
      // given
      const certificationCourseRepository = { get: sinon.stub(), update: sinon.stub() };
      const certificationEvaluationRepository = { rescoreV2Certification: sinon.stub() };
      const courseAssessmentResultRepository = { getLatestAssessmentResult: sinon.stub() };
      const juryId = 123;

      const dependencies = {
        certificationCourseRepository,
        certificationEvaluationRepository,
        courseAssessmentResultRepository,
      };
      const certificationCourse = domainBuilder.buildCertificationCourse({ version: AlgorithmEngineVersion.V2 });
      const certificationCourseId = certificationCourse.getId();

      certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(certificationCourse);
      certificationCourseRepository.update.resolves();
      certificationEvaluationRepository.rescoreV2Certification.resolves();
      courseAssessmentResultRepository.getLatestAssessmentResult.resolves(domainBuilder.buildAssessmentResult());

      // when
      await rejectCertificationCourse({
        ...dependencies,
        juryId,
        certificationCourseId: certificationCourseId,
      });

      // then
      const expectedCertificationCourse = new CertificationCourse({
        ...certificationCourse.toDTO(),
        isRejectedForFraud: true,
      });

      expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
        certificationCourse: expectedCertificationCourse,
      });

      expect(certificationEvaluationRepository.rescoreV2Certification).to.have.been.calledOnceWithExactly({
        event: new CertificationCourseRejected({
          certificationCourseId,
          juryId,
        }),
      });
    });
    describe('when certification has no previous assessment result', function () {
      it('should not cancel the certification', async function () {
        // given
        const juryId = 123;
        const session = domainBuilder.certification.sessionManagement.buildSessionManagement({
          finalizedAt: null,
          version: AlgorithmEngineVersion.V2,
        });
        const certificationCourse = domainBuilder.buildCertificationCourse({
          id: 123,
          sessionId: session.id,
          version: AlgorithmEngineVersion.V2,
        });
        const certificationCourseRepository = {
          get: sinon.stub(),
        };
        const sessionManagementRepository = {
          isFinalized: sinon.stub(),
        };
        const courseAssessmentResultRepository = {
          getLatestAssessmentResult: sinon.stub(),
        };
        certificationCourseRepository.get.withArgs({ id: 123 }).resolves(certificationCourse);
        sessionManagementRepository.isFinalized.withArgs({ id: certificationCourse.getSessionId() }).resolves(false);
        courseAssessmentResultRepository.getLatestAssessmentResult.resolves(null);

        // when
        const error = await catchErr(rejectCertificationCourse)({
          certificationCourseId: 123,
          certificationCourseRepository,
          sessionManagementRepository,
          juryId,
          courseAssessmentResultRepository,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('when certification is a V3', function () {
    it('should reject a newly created assessment result', async function () {
      // given
      const certificationCourseRepository = { get: sinon.stub(), update: sinon.stub() };
      const certificationEvaluationRepository = { rescoreV3Certification: sinon.stub() };
      const courseAssessmentResultRepository = { getLatestAssessmentResult: sinon.stub() };
      const juryId = 123;

      const dependencies = {
        certificationCourseRepository,
        certificationEvaluationRepository,
        courseAssessmentResultRepository,
      };
      const certificationCourse = domainBuilder.buildCertificationCourse({ version: AlgorithmEngineVersion.V3 });
      const certificationCourseId = certificationCourse.getId();

      certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(certificationCourse);
      certificationCourseRepository.update.resolves();
      certificationEvaluationRepository.rescoreV3Certification.resolves();
      courseAssessmentResultRepository.getLatestAssessmentResult.resolves(domainBuilder.buildAssessmentResult());

      // when
      await rejectCertificationCourse({
        ...dependencies,
        juryId,
        certificationCourseId: certificationCourseId,
      });

      // then
      const expectedCertificationCourse = new CertificationCourse({
        ...certificationCourse.toDTO(),
        isRejectedForFraud: true,
      });

      expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
        certificationCourse: expectedCertificationCourse,
      });

      expect(certificationEvaluationRepository.rescoreV3Certification).to.have.been.calledOnceWithExactly({
        event: new CertificationCourseRejected({
          certificationCourseId,
          juryId,
        }),
      });
    });
  });

  describe('when certification has no previous assessment result', function () {
    it('should not reject the certification and throw NotFoundError', async function () {
      // given
      const certificationCourseRepository = { get: sinon.stub(), update: sinon.stub() };
      const certificationEvaluationRepository = { rescoreV3Certification: sinon.stub() };
      const courseAssessmentResultRepository = { getLatestAssessmentResult: sinon.stub() };
      const juryId = 123;

      const dependencies = {
        certificationCourseRepository,
        certificationEvaluationRepository,
        courseAssessmentResultRepository,
      };
      const certificationCourse = domainBuilder.buildCertificationCourse({ version: AlgorithmEngineVersion.V3 });
      const certificationCourseId = certificationCourse.getId();

      certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(certificationCourse);
      courseAssessmentResultRepository.getLatestAssessmentResult.resolves(null);

      // when
      const error = await catchErr(rejectCertificationCourse)({
        ...dependencies,
        juryId,
        certificationCourseId: certificationCourseId,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(certificationCourseRepository.update).to.not.have.been.called;
      expect(certificationEvaluationRepository.rescoreV3Certification).to.not.have.been.called;
    });
  });
});
