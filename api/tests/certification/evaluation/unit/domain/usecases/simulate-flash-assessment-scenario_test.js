import { simulateFlashAssessmentScenario } from '../../../../../../src/certification/evaluation/domain/usecases/simulate-flash-assessment-scenario.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { FRENCH_FRANCE } from '../../../../../../src/shared/domain/services/locale-service.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('#simulateFlashAssessmentScenario', function () {
  describe('when a complementary certification scenario is required', function () {
    it('should fetch the complementary framework challenges', async function () {
      // given
      const locale = FRENCH_FRANCE;
      const accessibilityAdjustmentNeeded = false;
      const complementaryCertificationKey = ComplementaryCertificationKeys.PIX_PLUS_DROIT;
      const challengeRepositoryStub = { findActiveFlashCompatible: sinon.stub() };

      // when
      await catchErr(simulateFlashAssessmentScenario)({
        locale,
        accessibilityAdjustmentNeeded,
        complementaryCertificationKey,
        sharedChallengeRepository: challengeRepositoryStub,
      });

      // then
      expect(challengeRepositoryStub.findActiveFlashCompatible).to.have.been.calledOnceWithExactly({
        complementaryCertificationKey,
        locale,
        accessibilityAdjustmentNeeded: undefined,
      });
    });
  });

  describe('when a complementary certification scenario is not required', function () {
    it('should fetch the core referential challenges', async function () {
      // given
      const locale = FRENCH_FRANCE;
      const accessibilityAdjustmentNeeded = false;
      const challengeRepositoryStub = { findActiveFlashCompatible: sinon.stub() };

      // when
      await catchErr(simulateFlashAssessmentScenario)({
        locale,
        accessibilityAdjustmentNeeded,
        complementaryCertificationKey: undefined,
        sharedChallengeRepository: challengeRepositoryStub,
      });

      // then
      expect(challengeRepositoryStub.findActiveFlashCompatible).to.have.been.calledOnceWithExactly({
        locale,
        accessibilityAdjustmentNeeded,
        complementaryCertificationKey: undefined,
      });
    });
  });
});
