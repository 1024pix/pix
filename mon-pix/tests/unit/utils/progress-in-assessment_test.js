import { module, test } from 'qunit';
import EmberObject from '@ember/object';
import ENV from 'mon-pix/config/environment';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';

module('Unit | Utility | progress-in-assessment', function () {
  module('#getCurrentStepIndex', function (hooks) {
    let assessment;

    hooks.beforeEach(function () {
      ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS = 5;
      assessment = EmberObject.create({
        hasCheckpoints: true,
      });
    });

    test('should return the current step index modulus maxStepsNumber', function (assert) {
      // given
      const currentChallengeNumber = 6;
      // when
      const currentStepIndex = progressInAssessment.getCurrentStepIndex(assessment, currentChallengeNumber);

      // then
      assert.strictEqual(currentStepIndex, 1);
    });

    test('should return 0 when the assessment is a preview', function (assert) {
      // given
      assessment.isPreview = true;
      const currentChallengeNumber = 0;

      // when
      const currentStepIndex = progressInAssessment.getCurrentStepIndex(assessment, currentChallengeNumber);

      // then
      assert.strictEqual(currentStepIndex, 0);
    });
  });

  module('#getMaxStepsNumber', function () {
    test('when assessment has checkpoint, should return the number of challenges in checkpoint', function (assert) {
      // given
      const assessment = EmberObject.create({ hasCheckpoints: true });

      // when
      const maxStepNumber = progressInAssessment.getMaxStepsNumber(assessment);

      // then
      assert.strictEqual(maxStepNumber, ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS);
    });

    module('when assessment has flash method', function () {
      test('should return the maximum number of challenges', function (assert) {
        // given
        const assessment = EmberObject.create({ isFlash: true });

        // when
        const maxStepNumber = progressInAssessment.getMaxStepsNumber(assessment);

        // then
        assert.strictEqual(maxStepNumber, ENV.APP.NUMBER_OF_CHALLENGES_FOR_FLASH_METHOD);
      });

      test('when assessment is certification, should return the maximum number of challenges', function (assert) {
        // given
        const assessment = EmberObject.create({ isFlash: true, isCertification: true });

        // when
        const maxStepNumber = progressInAssessment.getMaxStepsNumber(assessment);

        // then
        assert.strictEqual(maxStepNumber, ENV.APP.NUMBER_OF_CHALLENGES_FOR_FLASH_METHOD);
      });
    });

    test('when assessment is certification, should return the number of challenges in certification', function (assert) {
      // given
      const nbChallenges = 23;
      const assessment = EmberObject.create({
        isCertification: true,
        certificationCourse: EmberObject.create({ nbChallenges }),
      });

      // when
      const maxStepNumber = progressInAssessment.getMaxStepsNumber(assessment);

      // then
      assert.strictEqual(maxStepNumber, nbChallenges);
    });

    test('should return the number of challenge in course', function (assert) {
      // given
      const nbChallenges = 21;
      const assessment = EmberObject.create({ course: EmberObject.create({ nbChallenges }) });

      // when
      const maxStepNumber = progressInAssessment.getMaxStepsNumber(assessment);

      // then
      assert.strictEqual(maxStepNumber, nbChallenges);
    });

    test('should return 1 when the assessment is a preview', function (assert) {
      // given
      const assessment = EmberObject.create({ isPreview: true });

      // when
      const maxStepNumber = progressInAssessment.getMaxStepsNumber(assessment);

      // then
      assert.strictEqual(maxStepNumber, 1);
    });
  });

  module('#getCurrentStepNumber', function (hooks) {
    let assessment;
    hooks.beforeEach(function () {
      ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS = 5;
      assessment = EmberObject.create({
        hasCheckpoints: true,
      });
    });

    test('should return the current step number modulus maxStepsNumber', async function (assert) {
      // given
      const currentChallengeNumber = 8;

      // when
      const currentStepIndex = progressInAssessment.getCurrentStepNumber(assessment, currentChallengeNumber);

      // then
      assert.strictEqual(currentStepIndex, 4);
    });
  });
});
