import { expect } from 'chai';
import sinon from 'sinon';

import { CERTIFICATION_RESULT_STATUSES } from '../../../../../../src/certification/results/domain/constants.ts';
import { updateEduV2ExternalJuryResult } from '../../../../../../src/certification/results/domain/usecases/update-edu-v2-external-jury-result.ts';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { featureToggles } from '../../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { logger } from '../../../../../../src/shared/infrastructure/utils/logger.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Certification | Results | Domain | Usecases | update-edu-v2-external-jury-result', function () {
  const certificationCourseId = 123;
  const v2EduVoletExterneBadgeId = 456;
  const v2EduVoletExterneAcquired = true;
  let newCertificationResultRepository;

  beforeEach(function () {
    newCertificationResultRepository = {
      getByCertificationCourseId: sinon.stub(),
      updateEduV2ExternalJuryResult: sinon.stub().resolves(),
    };
    sinon.stub(featureToggles, 'get').withArgs('writeNewCertificationResults').resolves(true);
    sinon.stub(logger, 'error');
  });

  context('when FT writeNewCertificationResults is disabled', function () {
    it('does nothing', async function () {
      // given
      featureToggles.get.withArgs('writeNewCertificationResults').resolves(false);

      // when
      await updateEduV2ExternalJuryResult({
        certificationCourseId,
        v2EduVoletExterneBadgeId,
        v2EduVoletExterneAcquired,
        newCertificationResultRepository,
      });

      // then
      expect(newCertificationResultRepository.getByCertificationCourseId).to.not.have.been.called;
      expect(newCertificationResultRepository.updateEduV2ExternalJuryResult).to.not.have.been.called;
    });
  });

  context('when no certification result is found', function () {
    it('does nothing', async function () {
      // given
      newCertificationResultRepository.getByCertificationCourseId.withArgs(certificationCourseId).resolves(null);

      // when
      await updateEduV2ExternalJuryResult({
        certificationCourseId,
        v2EduVoletExterneBadgeId,
        v2EduVoletExterneAcquired,
        newCertificationResultRepository,
      });

      // then
      expect(logger.error).to.not.have.been.called;
      expect(newCertificationResultRepository.updateEduV2ExternalJuryResult).to.not.have.been.called;
    });
  });

  context('when the certification result is not an Edu one', function () {
    it('logs an error and does not update anything', async function () {
      // given
      const certificationResult = domainBuilder.certification.results.buildNewCertificationResult({
        algorithmEngineVersion: AlgorithmEngineVersion.V2,
        framework: Frameworks.DROIT,
        status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
        v2ComplementaryVoletPixAcquired: true,
      });
      newCertificationResultRepository.getByCertificationCourseId
        .withArgs(certificationCourseId)
        .resolves(certificationResult);

      // when
      await updateEduV2ExternalJuryResult({
        certificationCourseId,
        v2EduVoletExterneBadgeId,
        v2EduVoletExterneAcquired,
        newCertificationResultRepository,
      });

      // then
      expect(logger.error).to.have.been.calledOnce;
      expect(newCertificationResultRepository.updateEduV2ExternalJuryResult).to.not.have.been.called;
    });
  });

  context('when the certification result is not a V2 one', function () {
    it('logs an error and does not update anything', async function () {
      // given
      const certificationResult = domainBuilder.certification.results.buildNewCertificationResult({
        algorithmEngineVersion: AlgorithmEngineVersion.V3,
        framework: Frameworks.EDU_2ND_DEGRE,
        status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
      });
      newCertificationResultRepository.getByCertificationCourseId
        .withArgs(certificationCourseId)
        .resolves(certificationResult);

      // when
      await updateEduV2ExternalJuryResult({
        certificationCourseId,
        v2EduVoletExterneBadgeId,
        v2EduVoletExterneAcquired,
        newCertificationResultRepository,
      });

      // then
      expect(logger.error).to.have.been.calledOnce;
      expect(newCertificationResultRepository.updateEduV2ExternalJuryResult).to.not.have.been.called;
    });
  });

  context('when the volet Pix of the V2 Edu certification result is not acquired', function () {
    it('logs an error and does not update anything', async function () {
      // given
      const certificationResult = domainBuilder.certification.results.buildNewCertificationResult({
        algorithmEngineVersion: AlgorithmEngineVersion.V2,
        framework: Frameworks.EDU_2ND_DEGRE,
        status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
        v2ComplementaryVoletPixAcquired: false,
      });
      newCertificationResultRepository.getByCertificationCourseId
        .withArgs(certificationCourseId)
        .resolves(certificationResult);

      // when
      await updateEduV2ExternalJuryResult({
        certificationCourseId,
        v2EduVoletExterneBadgeId,
        v2EduVoletExterneAcquired,
        newCertificationResultRepository,
      });

      // then
      expect(logger.error).to.have.been.calledOnce;
      expect(newCertificationResultRepository.updateEduV2ExternalJuryResult).to.not.have.been.called;
    });
  });

  context('when the volet Pix of the V2 Edu certification result is acquired', function () {
    it('updates the external jury result', async function () {
      // given
      const certificationResult = domainBuilder.certification.results.buildNewCertificationResult({
        algorithmEngineVersion: AlgorithmEngineVersion.V2,
        framework: Frameworks.EDU_2ND_DEGRE,
        status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
        v2ComplementaryVoletPixAcquired: true,
      });
      newCertificationResultRepository.getByCertificationCourseId
        .withArgs(certificationCourseId)
        .resolves(certificationResult);

      // when
      await updateEduV2ExternalJuryResult({
        certificationCourseId,
        v2EduVoletExterneBadgeId,
        v2EduVoletExterneAcquired,
        newCertificationResultRepository,
      });

      // then
      expect(logger.error).to.not.have.been.called;
      expect(newCertificationResultRepository.updateEduV2ExternalJuryResult).to.have.been.calledOnceWithExactly({
        certificationResultId: certificationResult.id,
        v2EduVoletExterneBadgeId,
        v2EduVoletExterneAcquired,
      });
    });
  });
});
