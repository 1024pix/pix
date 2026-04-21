import sinon from 'sinon';

import { uncancel } from '../../../../../../src/certification/session-management/domain/usecases/uncancel.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { NotFinalizedSessionError } from '../../../../../../src/shared/domain/errors.js';
import CertificationUncancelled from '../../../../../../src/shared/domain/events/CertificationUncancelled.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Session-management | Unit | Domain | UseCases | uncancel', function () {
  describe('when certification is a V2', function () {
    it('should uncancel the certification', async function () {
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
      const certificationEvaluationRepository = {
        rescoreV2Certification: sinon.stub(),
      };
      const sessionManagementRepository = {
        isFinalized: sinon.stub(),
      };
      certificationCourseRepository.get.withArgs({ id: 123 }).resolves(certificationCourse);
      certificationEvaluationRepository.rescoreV2Certification.resolves();
      sessionManagementRepository.isFinalized.withArgs({ id: certificationCourse.getSessionId() }).resolves(true);

      // when
      await uncancel({
        certificationCourseId: 123,
        juryId,
        certificationCourseRepository,
        certificationEvaluationRepository,
        sessionManagementRepository,
      });

      // then
      expect(certificationEvaluationRepository.rescoreV2Certification).to.have.been.calledWithExactly({
        event: new CertificationUncancelled({
          certificationCourseId: certificationCourse.getId(),
          juryId,
        }),
      });
    });

    describe('when session is not finalized', function () {
      it('should not uncancel the certification', async function () {
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
        certificationCourseRepository.get.withArgs({ id: 123 }).resolves(certificationCourse);
        sessionManagementRepository.isFinalized.withArgs({ id: certificationCourse.getSessionId() }).resolves(false);

        // when
        const error = await catchErr(uncancel)({
          juryId,
          certificationCourseId: 123,
          certificationCourseRepository,
          sessionManagementRepository,
        });

        // then
        expect(error).to.be.instanceOf(NotFinalizedSessionError);
      });
    });
  });

  describe('when certification is a V3', function () {
    it('should uncancel the certification', async function () {
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
      const certificationEvaluationRepository = {
        rescoreV3Certification: sinon.stub(),
      };
      const sessionManagementRepository = {
        isFinalized: sinon.stub(),
      };
      certificationCourseRepository.get.withArgs({ id: 123 }).resolves(certificationCourse);
      certificationEvaluationRepository.rescoreV3Certification.resolves();
      sessionManagementRepository.isFinalized.withArgs({ id: certificationCourse.getSessionId() }).resolves(true);

      // when
      await uncancel({
        certificationCourseId: 123,
        juryId,
        certificationCourseRepository,
        certificationEvaluationRepository,
        sessionManagementRepository,
      });

      // then
      expect(certificationEvaluationRepository.rescoreV3Certification).to.have.been.calledWithExactly({
        event: new CertificationUncancelled({
          certificationCourseId: certificationCourse.getId(),
          juryId,
        }),
      });
    });

    describe('when session is not finalized', function () {
      it('should not uncancel the certification', async function () {
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
        certificationCourseRepository.get.withArgs({ id: 123 }).resolves(certificationCourse);
        sessionManagementRepository.isFinalized.withArgs({ id: certificationCourse.getSessionId() }).resolves(false);

        // when
        const error = await catchErr(uncancel)({
          juryId,
          certificationCourseId: 123,
          certificationCourseRepository,
          sessionManagementRepository,
        });

        // then
        expect(error).to.be.instanceOf(NotFinalizedSessionError);
      });
    });
  });
});
