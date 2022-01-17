import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import ENV from 'mon-pix/config/environment';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';

describe('Unit | Utility | progress-in-assessment', function () {
  describe('#getCurrentStepIndex', function () {
    let assessment;

    beforeEach(function () {
      ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS = 5;
      assessment = EmberObject.create({
        hasCheckpoints: true,
      });
    });

    it('should return the current step index modulus maxStepsNumber', function () {
      // given
      const currentChallengeNumber = 6;
      // when
      const currentStepIndex = progressInAssessment.getCurrentStepIndex(assessment, currentChallengeNumber);

      // then
      expect(currentStepIndex).to.equal(1);
    });

    it('should return 0 when the assessment is a preview', function () {
      // given
      assessment.isPreview = true;
      const currentChallengeNumber = 0;

      // when
      const currentStepIndex = progressInAssessment.getCurrentStepIndex(assessment, currentChallengeNumber);

      // then
      expect(currentStepIndex).to.equal(0);
    });
  });

  describe('#getMaxStepsNumber', function () {
    it('when assessment has checkpoint, should return the number of challenges in checkpoint', function () {
      // given
      const assessment = EmberObject.create({ hasCheckpoints: true });

      // when
      const maxStepNumber = progressInAssessment.getMaxStepsNumber(assessment);

      // then
      expect(maxStepNumber).to.equal(ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS);
    });

    describe('when assessment has flash method', function () {
      it('should return the maximum number of challenges', function () {
        // given
        const assessment = EmberObject.create({ isFlash: true });

        // when
        const maxStepNumber = progressInAssessment.getMaxStepsNumber(assessment);

        // then
        expect(maxStepNumber).to.equal(ENV.APP.NUMBER_OF_CHALLENGES_FOR_FLASH_METHOD);
      });

      it('when assessment is certification, should return the maximum number of challenges', function () {
        // given
        const assessment = EmberObject.create({ isFlash: true, isCertification: true });

        // when
        const maxStepNumber = progressInAssessment.getMaxStepsNumber(assessment);

        // then
        expect(maxStepNumber).to.equal(ENV.APP.NUMBER_OF_CHALLENGES_FOR_FLASH_METHOD);
      });
    });

    it('when assessment is certification, should return the number of challenges in certification', function () {
      // given
      const nbChallenges = 23;
      const assessment = EmberObject.create({
        isCertification: true,
        certificationCourse: EmberObject.create({ nbChallenges }),
      });

      // when
      const maxStepNumber = progressInAssessment.getMaxStepsNumber(assessment);

      // then
      expect(maxStepNumber).to.equal(nbChallenges);
    });

    it('should return the number of challenge in course', function () {
      // given
      const nbChallenges = 21;
      const assessment = EmberObject.create({ course: EmberObject.create({ nbChallenges }) });

      // when
      const maxStepNumber = progressInAssessment.getMaxStepsNumber(assessment);

      // then
      expect(maxStepNumber).to.equal(nbChallenges);
    });

    it('should return 1 when the assessment is a preview', function () {
      // given
      const assessment = EmberObject.create({ isPreview: true });

      // when
      const maxStepNumber = progressInAssessment.getMaxStepsNumber(assessment);

      // then
      expect(maxStepNumber).to.equal(1);
    });
  });

  describe('#getCurrentStepNumber', function () {
    let assessment;
    beforeEach(function () {
      ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS = 5;
      assessment = EmberObject.create({
        hasCheckpoints: true,
      });
    });

    it('should return the current step number modulus maxStepsNumber', async function () {
      // given
      const currentChallengeNumber = 8;

      // when
      const currentStepIndex = progressInAssessment.getCurrentStepNumber(assessment, currentChallengeNumber);

      // then
      expect(currentStepIndex).to.equal(4);
    });
  });
});
