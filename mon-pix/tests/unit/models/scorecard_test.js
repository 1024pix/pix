import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import ENV from 'mon-pix/config/environment';

module('Unit | Model | Scorecard model', function (hooks) {
  const maxReachableLevel = ENV.APP.MAX_REACHABLE_LEVEL;
  let scorecard;

  setupTest(hooks);

  hooks.beforeEach(function () {
    scorecard = run(() => this.owner.lookup('service:store').createRecord('scorecard'));
  });

  module('percentageAheadOfNextLevel', function () {
    [
      { pixScoreAheadOfNextLevel: 0, expectedPercentageAheadOfNextLevel: 0 },
      { pixScoreAheadOfNextLevel: 4, expectedPercentageAheadOfNextLevel: 50 },
      { pixScoreAheadOfNextLevel: 3.33, expectedPercentageAheadOfNextLevel: 41.625 },
      { pixScoreAheadOfNextLevel: 7.8, expectedPercentageAheadOfNextLevel: 95 },
    ].forEach((data) => {
      test(`should return ${data.expectedPercentageAheadOfNextLevel} when pixScoreAheadOfNextLevel is ${data.pixScoreAheadOfNextLevel}`, function (assert) {
        // given
        scorecard.pixScoreAheadOfNextLevel = data.pixScoreAheadOfNextLevel;

        // when
        const percentageAheadOfNextLevel = scorecard.percentageAheadOfNextLevel;

        // then
        assert.equal(percentageAheadOfNextLevel, data.expectedPercentageAheadOfNextLevel);
      });
    });
  });

  module('remainingPixToNextLevel', function () {
    test('should return 2 remaining Pix to next level', function (assert) {
      // given
      scorecard.pixScoreAheadOfNextLevel = 3;

      // when
      const remainingPixToNextLevel = scorecard.remainingPixToNextLevel;

      // then
      assert.equal(remainingPixToNextLevel, 5);
    });
  });

  module('isMaxLevel', function () {
    test('should return true', function (assert) {
      // given
      scorecard.level = maxReachableLevel;

      // when
      const isMaxLevel = scorecard.isMaxLevel;

      // then
      assert.true(isMaxLevel);
    });

    test('should return false', function (assert) {
      // given
      scorecard.level = 2;

      // when
      const isMaxLevel = scorecard.isMaxLevel;

      // then
      assert.false(isMaxLevel);
    });
  });

  module('isFinishedWithMaxLevel', function () {
    module('when max level is reached', function () {
      test('should return true', function (assert) {
        // given
        scorecard.level = maxReachableLevel;
        scorecard.status = 'COMPLETED';

        // when
        const isFinishedWithMaxLevel = scorecard.isFinishedWithMaxLevel;

        // then
        assert.true(isFinishedWithMaxLevel);
      });

      test('should return false', function (assert) {
        // given
        scorecard.level = maxReachableLevel;
        scorecard.status = 'STARTED';

        // when
        const isFinishedWithMaxLevel = scorecard.isFinishedWithMaxLevel;

        // then
        assert.false(isFinishedWithMaxLevel);
      });
    });

    module('when max level is not reached', function () {
      test('should return true', function (assert) {
        // given
        scorecard.level = 3;
        scorecard.status = 'COMPLETED';

        // when
        const isFinishedWithMaxLevel = scorecard.isFinishedWithMaxLevel;

        // then
        assert.false(isFinishedWithMaxLevel);
      });

      test('should return false', function (assert) {
        // given
        scorecard.level = 3;
        scorecard.status = 'STARTED';

        // when
        const isFinishedWithMaxLevel = scorecard.isFinishedWithMaxLevel;

        // then
        assert.false(isFinishedWithMaxLevel);
      });
    });
  });

  module('isImprovable', function () {
    module('when the competence is finished with max level', function () {
      test('should return false', function (assert) {
        // given
        scorecard.level = maxReachableLevel;
        scorecard.status = 'COMPLETED';
        scorecard.remainingDaysBeforeImproving = 0;

        // when
        const isImprovable = scorecard.isImprovable;

        // then
        assert.false(isImprovable);
      });
    });

    module('when the competence is not finished', function () {
      test('should return false', function (assert) {
        // given
        scorecard.level = maxReachableLevel;
        scorecard.status = 'STARTED';
        scorecard.remainingDaysBeforeImproving = 0;

        // when
        const isImprovable = scorecard.isImprovable;

        // then
        assert.false(isImprovable);
      });
    });

    module('when there are remaining days before improving', function () {
      test('should return false', function (assert) {
        // given
        scorecard.level = maxReachableLevel;
        scorecard.status = 'COMPLETED';
        scorecard.remainingDaysBeforeImproving = 1;

        // when
        const isImprovable = scorecard.isImprovable;

        // then
        assert.false(isImprovable);
      });
    });

    module(
      'when the competence is finished without reaching the max level and there are no remaining days before improving',
      function () {
        test('should return true', function (assert) {
          // given
          scorecard.level = 3;
          scorecard.status = 'COMPLETED';
          scorecard.remainingDaysBeforeImproving = 0;

          // when
          const isImprovable = scorecard.isImprovable;

          // then
          assert.true(isImprovable);
        });
      }
    );
  });

  module('hasNotEarnAnything', function () {
    test('should return true', function (assert) {
      // given
      scorecard.earnedPix = 0;

      // when
      const hasNotEarnAnything = scorecard.hasNotEarnAnything;

      // then
      assert.true(hasNotEarnAnything);
    });

    test('should return false', function (assert) {
      // given
      scorecard.earnedPix = 2;

      // when
      const hasNotEarnAnything = scorecard.hasNotEarnAnything;

      // then
      assert.false(hasNotEarnAnything);
    });
  });

  module('hasNotReachLevelOne', function () {
    test('should return true', function (assert) {
      // given
      scorecard.level = 0;

      // when
      const hasNotReachLevelOne = scorecard.hasNotReachLevelOne;

      // then
      assert.true(hasNotReachLevelOne);
    });

    test('should return false if level is 1', function (assert) {
      // given
      scorecard.level = 1;

      // when
      const hasNotReachLevelOne = scorecard.hasNotReachLevelOne;

      // then
      assert.false(hasNotReachLevelOne);
    });

    test('should return false if level > 1', function (assert) {
      // given
      scorecard.level = 2;

      // when
      const hasNotReachLevelOne = scorecard.hasNotReachLevelOne;

      // then
      assert.false(hasNotReachLevelOne);
    });
  });

  module('hasReachAtLeastLevelOne', function () {
    test('should return true if level is 1', function (assert) {
      // given
      scorecard.level = 1;

      // when
      const hasReachAtLeastLevelOne = scorecard.hasReachAtLeastLevelOne;

      // then
      assert.true(hasReachAtLeastLevelOne);
    });

    test('should return true if level is 4', function (assert) {
      // given
      scorecard.level = 4;

      // when
      const hasReachAtLeastLevelOne = scorecard.hasReachAtLeastLevelOne;

      // then
      assert.true(hasReachAtLeastLevelOne);
    });

    test('should return false', function (assert) {
      // given
      scorecard.level = 0;

      // when
      const hasReachAtLeastLevelOne = scorecard.hasReachAtLeastLevelOne;

      // then
      assert.false(hasReachAtLeastLevelOne);
    });
  });
});
