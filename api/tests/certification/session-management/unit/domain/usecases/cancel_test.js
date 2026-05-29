import { expect } from 'chai';
import sinon from 'sinon';

import { cancel } from '../../../../../../src/certification/session-management/domain/usecases/cancel.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { NotFinalizedSessionError, NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import CertificationCancelled from '../../../../../../src/shared/domain/events/CertificationCancelled.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Session-management | Unit | Domain | UseCases | cancel', function () {
  describe('when it is a v2 certification', function () {
    describe('when session is finalized', function () {
      it('should cancel the certification', async function () {
        // given
        const juryId = 123;
        const session = domainBuilder.certification.sessionManagement.buildSessionManagement({
          finalizedAt: new Date('2020-01-01'),
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
        const certificationEvaluationRepository = {
          rescoreV2Certification: sinon.stub(),
        };
        const courseAssessmentResultRepository = {
          getLatestAssessmentResult: sinon.stub(),
        };
        certificationCourseRepository.get.withArgs({ id: 123 }).resolves(certificationCourse);
        certificationEvaluationRepository.rescoreV2Certification.resolves();
        sessionManagementRepository.isFinalized.withArgs({ id: certificationCourse.getSessionId() }).resolves(true);
        courseAssessmentResultRepository.getLatestAssessmentResult.resolves(domainBuilder.buildAssessmentResult());

        // when
        await cancel({
          certificationCourseId: 123,
          juryId,
          certificationCourseRepository,
          sessionManagementRepository,
          certificationEvaluationRepository,
          courseAssessmentResultRepository,
        });

        // then
        expect(certificationEvaluationRepository.rescoreV2Certification).to.have.been.calledWithExactly({
          event: new CertificationCancelled({
            certificationCourseId: certificationCourse.getId(),
            juryId,
          }),
        });
      });
    });

    describe('when session is not finalized', function () {
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
        courseAssessmentResultRepository.getLatestAssessmentResult.resolves(domainBuilder.buildAssessmentResult());

        // when
        const error = await catchErr(cancel)({
          certificationCourseId: 123,
          certificationCourseRepository,
          sessionManagementRepository,
          juryId,
          courseAssessmentResultRepository,
        });

        // then
        expect(error).to.be.instanceOf(NotFinalizedSessionError);
      });
    });
    describe('when certification has no previous assessment result', function () {
      it('should not cancel the certification', async function () {
        // given
        const juryId = 123;
        const session = domainBuilder.certification.sessionManagement.buildSessionManagement({
          finalizedAt: new Date('2020-01-01'),
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
        const certificationEvaluationRepository = {
          rescoreV2Certification: sinon.stub(),
        };
        const courseAssessmentResultRepository = {
          getLatestAssessmentResult: sinon.stub(),
        };
        certificationCourseRepository.get.withArgs({ id: 123 }).resolves(certificationCourse);
        certificationEvaluationRepository.rescoreV2Certification.resolves();
        sessionManagementRepository.isFinalized.withArgs({ id: certificationCourse.getSessionId() }).resolves(true);
        courseAssessmentResultRepository.getLatestAssessmentResult.resolves(null);

        // when
        const error = await catchErr(cancel)({
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

  describe('when it is a v3 certification', function () {
    describe('when session is finalized', function () {
      it('should cancel the certification', async function () {
        // given
        const juryId = 123;
        const session = domainBuilder.certification.sessionManagement.buildSessionManagement({
          finalizedAt: new Date('2020-01-01'),
          version: AlgorithmEngineVersion.V3,
        });
        const certificationCourse = domainBuilder.buildCertificationCourse({
          id: 123,
          sessionId: session.id,
          version: AlgorithmEngineVersion.V3,
        });
        const certificationCourseRepository = {
          get: sinon.stub(),
        };
        const sessionManagementRepository = {
          isFinalized: sinon.stub(),
        };
        const certificationEvaluationRepository = {
          rescoreV3Certification: sinon.stub(),
        };
        const courseAssessmentResultRepository = {
          getLatestAssessmentResult: sinon.stub(),
        };
        certificationCourseRepository.get.withArgs({ id: 123 }).resolves(certificationCourse);
        certificationEvaluationRepository.rescoreV3Certification.resolves();
        sessionManagementRepository.isFinalized.withArgs({ id: certificationCourse.getSessionId() }).resolves(true);
        courseAssessmentResultRepository.getLatestAssessmentResult.resolves(domainBuilder.buildAssessmentResult());

        // when
        await cancel({
          certificationCourseId: 123,
          juryId,
          certificationCourseRepository,
          sessionManagementRepository,
          certificationEvaluationRepository,
          courseAssessmentResultRepository,
        });

        // then
        expect(certificationEvaluationRepository.rescoreV3Certification).to.have.been.calledWithExactly({
          event: new CertificationCancelled({
            certificationCourseId: certificationCourse.getId(),
            juryId,
          }),
        });
      });
    });

    describe('when session is not finalized', function () {
      it('should not cancel the certification', async function () {
        // given
        const juryId = 123;
        const session = domainBuilder.certification.sessionManagement.buildSessionManagement({
          finalizedAt: null,
          version: AlgorithmEngineVersion.V3,
        });
        const certificationCourse = domainBuilder.buildCertificationCourse({
          id: 123,
          sessionId: session.id,
          version: AlgorithmEngineVersion.V3,
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
        const error = await catchErr(cancel)({
          certificationCourseId: 123,
          certificationCourseRepository,
          sessionManagementRepository,
          juryId,
          courseAssessmentResultRepository,
        });

        // then
        expect(error).to.be.instanceOf(NotFinalizedSessionError);
      });
    });
  });
  describe('when certification has no previous assessment result', function () {
    it('should not reject the certification and throw NotFoundError', async function () {
      // given
      const juryId = 123;
      const session = domainBuilder.certification.sessionManagement.buildSessionManagement({
        finalizedAt: new Date('2020-01-01'),
        version: AlgorithmEngineVersion.V3,
      });
      const certificationCourse = domainBuilder.buildCertificationCourse({
        id: 123,
        sessionId: session.id,
        version: AlgorithmEngineVersion.V3,
      });
      const certificationCourseRepository = {
        get: sinon.stub(),
      };
      const sessionManagementRepository = {
        isFinalized: sinon.stub(),
      };
      const certificationEvaluationRepository = {
        rescoreV3Certification: sinon.stub(),
      };
      const courseAssessmentResultRepository = {
        getLatestAssessmentResult: sinon.stub(),
      };
      certificationCourseRepository.get.withArgs({ id: 123 }).resolves(certificationCourse);
      certificationEvaluationRepository.rescoreV3Certification.resolves();
      sessionManagementRepository.isFinalized.withArgs({ id: certificationCourse.getSessionId() }).resolves(true);
      courseAssessmentResultRepository.getLatestAssessmentResult.resolves(null);

      // when
      const error = await catchErr(cancel)({
        certificationCourseId: 123,
        juryId,
        certificationCourseRepository,
        sessionManagementRepository,
        certificationEvaluationRepository,
        courseAssessmentResultRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(certificationEvaluationRepository.rescoreV3Certification).to.not.have.been.called;
    });
  });
});
