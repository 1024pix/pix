import { simulateFlashAssessmentScenario } from '../../../../../../src/certification/evaluation/domain/usecases/simulate-flash-assessment-scenario.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { FRENCH_FRANCE } from '../../../../../../src/shared/domain/services/locale-service.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Domain | Usecases | simulate-flash-assessment-scenario', function () {
  describe('#simulateFlashAssessmentScenario', function () {
    describe('when simulating a complementary certification', function () {
      describe('when the certification does not have a complementary referential', function () {
        it('should fetch the core framework challenges', async function () {
          // given
          const locale = FRENCH_FRANCE;
          const accessibilityAdjustmentNeeded = false;
          const complementaryCertificationKey = ComplementaryCertificationKeys.CLEA;
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
            hasComplementaryReferential: false,
            versionId: undefined,
          });
        });
      });

      describe('when the certification has a complementary referential', function () {
        describe('when given a complementary certification key', function () {
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
              hasComplementaryReferential: true,
              versionId: undefined,
            });
          });
        });

        describe('when given a versionId', function () {
          it('should fetch the complementary framework challenges', async function () {
            // given
            const locale = FRENCH_FRANCE;
            const accessibilityAdjustmentNeeded = false;
            const versionId = 1;
            const challengeRepositoryStub = { findActiveFlashCompatible: sinon.stub() };

            // when
            await catchErr(simulateFlashAssessmentScenario)({
              locale,
              accessibilityAdjustmentNeeded,
              versionId,
              sharedChallengeRepository: challengeRepositoryStub,
            });

            // then
            expect(challengeRepositoryStub.findActiveFlashCompatible).to.have.been.calledOnceWithExactly({
              complementaryCertificationKey: undefined,
              locale,
              accessibilityAdjustmentNeeded: undefined,
              hasComplementaryReferential: true,
              versionId,
            });
          });
        });
      });
    });

    describe('when simulating a core certification', function () {
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
          hasComplementaryReferential: undefined,
          versionId: undefined,
        });
      });
    });
  });
});
