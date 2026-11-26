import { expect } from 'chai';
import sinon from 'sinon';

import { CERTIFICATION_RESULT_STATUSES } from '../../../../../../src/certification/results/domain/constants.ts';
import { updateEduV3ExternalJuryResult } from '../../../../../../src/certification/results/domain/usecases/update-edu-v3-external-jury-result.ts';
import { PIX_PLUS_EDU_EXTERNAL_LEVELS } from '../../../../../../src/certification/shared/domain/constants/mesh-configuration.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { featureToggles } from '../../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { logger } from '../../../../../../src/shared/infrastructure/utils/logger.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Certification | Results | Domain | Usecases | update-edu-v3-external-jury-result', function () {
  const certificationCourseId = 123;
  let newCertificationResultRepository;

  beforeEach(function () {
    newCertificationResultRepository = {
      getByCertificationCourseId: sinon.stub(),
      updateEduV3ExternalJuryResult: sinon.stub().resolves(),
    };
    sinon.stub(featureToggles, 'get').withArgs('writeNewCertificationResults').resolves(true);
    sinon.stub(logger, 'error');
  });

  context('when FT writeNewCertificationResults is disabled', function () {
    it('does nothing', async function () {
      // given
      featureToggles.get.withArgs('writeNewCertificationResults').resolves(false);

      // when
      await updateEduV3ExternalJuryResult({
        certificationCourseId,
        v3EduExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
        newCertificationResultRepository,
      });

      // then
      expect(newCertificationResultRepository.getByCertificationCourseId).to.not.have.been.called;
      expect(newCertificationResultRepository.updateEduV3ExternalJuryResult).to.not.have.been.called;
    });
  });

  context('when no certification result is found', function () {
    it('does nothing', async function () {
      // given
      newCertificationResultRepository.getByCertificationCourseId.withArgs(certificationCourseId).resolves(null);

      // when
      await updateEduV3ExternalJuryResult({
        certificationCourseId,
        v3EduExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
        newCertificationResultRepository,
      });

      // then
      expect(logger.error).to.not.have.been.called;
      expect(newCertificationResultRepository.updateEduV3ExternalJuryResult).to.not.have.been.called;
    });
  });

  context('when the certification result is not an Edu one', function () {
    it('logs an error and does not update anything', async function () {
      // given
      const certificationResult = domainBuilder.certification.results.buildNewCertificationResult({
        algorithmEngineVersion: AlgorithmEngineVersion.V3,
        framework: Frameworks.CORE,
        status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
      });
      newCertificationResultRepository.getByCertificationCourseId
        .withArgs(certificationCourseId)
        .resolves(certificationResult);

      // when
      await updateEduV3ExternalJuryResult({
        certificationCourseId,
        v3EduExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
        newCertificationResultRepository,
      });

      // then
      expect(logger.error).to.have.been.calledOnce;
      expect(newCertificationResultRepository.updateEduV3ExternalJuryResult).to.not.have.been.called;
    });
  });

  context('when the certification result is not a V3 one', function () {
    it('logs an error and does not update anything', async function () {
      // given
      const certificationResult = domainBuilder.certification.results.buildNewCertificationResult({
        algorithmEngineVersion: AlgorithmEngineVersion.V2,
        framework: Frameworks.EDU_2ND_DEGRE,
        status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
      });
      newCertificationResultRepository.getByCertificationCourseId
        .withArgs(certificationCourseId)
        .resolves(certificationResult);

      // when
      await updateEduV3ExternalJuryResult({
        certificationCourseId,
        v3EduExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
        newCertificationResultRepository,
      });

      // then
      expect(logger.error).to.have.been.calledOnce;
      expect(newCertificationResultRepository.updateEduV3ExternalJuryResult).to.not.have.been.called;
    });
  });

  context('when the V3 Edu certification result is not validated', function () {
    it('logs an error and does not update anything', async function () {
      // given
      const certificationResult = domainBuilder.certification.results.buildNewCertificationResult({
        algorithmEngineVersion: AlgorithmEngineVersion.V3,
        framework: Frameworks.EDU_2ND_DEGRE,
        status: CERTIFICATION_RESULT_STATUSES.REJECTED,
      });
      newCertificationResultRepository.getByCertificationCourseId
        .withArgs(certificationCourseId)
        .resolves(certificationResult);

      // when
      await updateEduV3ExternalJuryResult({
        certificationCourseId,
        v3EduExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
        newCertificationResultRepository,
      });

      // then
      expect(logger.error).to.have.been.calledOnce;
      expect(newCertificationResultRepository.updateEduV3ExternalJuryResult).to.not.have.been.called;
    });
  });

  context('when the V3 Edu certification result is validated', function () {
    it('updates the external jury result', async function () {
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
      await updateEduV3ExternalJuryResult({
        certificationCourseId,
        v3EduExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
        newCertificationResultRepository,
      });

      // then
      expect(logger.error).to.not.have.been.called;
      expect(newCertificationResultRepository.updateEduV3ExternalJuryResult).to.have.been.calledOnceWithExactly({
        certificationResultId: certificationResult.id,
        newExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
      });
    });
  });
});
