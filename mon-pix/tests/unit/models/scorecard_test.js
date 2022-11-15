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
      assert.equal(isMaxLevel, true);
    });

    test('should return false', function (assert) {
      // given
      scorecard.level = 2;

      // when
      const isMaxLevel = scorecard.isMaxLevel;

      // then
      assert.equal(isMaxLevel, false);
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
        assert.equal(isFinishedWithMaxLevel, true);
      });

      test('should return false', function (assert) {
        // given
        scorecard.level = maxReachableLevel;
        scorecard.status = 'STARTED';

        // when
        const isFinishedWithMaxLevel = scorecard.isFinishedWithMaxLevel;

        // then
        assert.equal(isFinishedWithMaxLevel, false);
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
        assert.equal(isFinishedWithMaxLevel, false);
      });

      test('should return false', function (assert) {
        // given
        scorecard.level = 3;
        scorecard.status = 'STARTED';

        // when
        const isFinishedWithMaxLevel = scorecard.isFinishedWithMaxLevel;

        // then
        assert.equal(isFinishedWithMaxLevel, false);
      });
    });
  });

  module('isProgressable', function () {
    module('when the competence is finished', function () {
      test('should return false', function (assert) {
        // given
        scorecard.status = 'COMPLETED';

        // when
        const isProgressable = scorecard.isProgressable;

        // then
        assert.equal(isProgressable, false);
      });
    });

    module('when the competence is not started', function () {
      test('should return false', function (assert) {
        // given
        scorecard.status = 'NOT_STARTED';

        // when
        const isProgressable = scorecard.isProgressable;

        // then
        assert.equal(isProgressable, false);
      });
    });

    module('when the competence is started', function () {
      module('and max level is reached', function () {
        test('should return false', function (assert) {
          // given
          scorecard.level = maxReachableLevel;
          scorecard.status = 'STARTED';

          // when
          const isProgressable = scorecard.isProgressable;

          // then
          assert.equal(isProgressable, false);
        });
      });

      module('when max level is not reached', function () {
        test('should return true', function (assert) {
          // given
          scorecard.level = 1;
          scorecard.status = 'STARTED';

          // when
          const isProgressable = scorecard.isProgressable;

          // then
          assert.equal(isProgressable, true);
        });
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
        assert.equal(isImprovable, false);
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
        assert.equal(isImprovable, false);
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
        assert.equal(isImprovable, false);
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
          assert.equal(isImprovable, true);
        });
      }
    );
  });

  module('shouldWaitBeforeImproving', function () {
    module('when the competence is not started', function () {
      test('should return false', function (assert) {
        // given
        scorecard.status = 'NOT_STARTED';

        // when
        const shouldWaitBeforeImproving = scorecard.shouldWaitBeforeImproving;

        // then
        assert.equal(shouldWaitBeforeImproving, false);
      });
    });

    module('when the competence is started', function () {
      test('should return false', function (assert) {
        // given
        scorecard.status = 'STARTED';

        // when
        const shouldWaitBeforeImproving = scorecard.shouldWaitBeforeImproving;

        // then
        assert.equal(shouldWaitBeforeImproving, false);
      });
    });

    module('when the competence is finished', function (hooks) {
      hooks.beforeEach(function () {
        scorecard.status = 'COMPLETED';
      });

      module('when the max level is reached', function () {
        test('should return false', function (assert) {
          // given
          scorecard.level = maxReachableLevel;

          // when
          const shouldWaitBeforeImproving = scorecard.shouldWaitBeforeImproving;

          // then
          assert.equal(shouldWaitBeforeImproving, false);
        });
      });

      module('when the max level is not reached', function () {
        module('when there are remaining days before improving', function () {
          test('should return true', function (assert) {
            // given
            scorecard.level = 2;
            scorecard.remainingDaysBeforeImproving = 1;

            // when
            const shouldWaitBeforeImproving = scorecard.shouldWaitBeforeImproving;

            // then
            assert.equal(shouldWaitBeforeImproving, true);
          });
        });

        module('when there are no remaining days before improving', function () {
          test('should return false', function (assert) {
            // given
            scorecard.level = 2;
            scorecard.remainingDaysBeforeImproving = 0;

            // when
            const shouldWaitBeforeImproving = scorecard.shouldWaitBeforeImproving;

            // then
            assert.equal(shouldWaitBeforeImproving, false);
          });
        });
      });
    });
  });

  module('isResettable', function () {
    module('when the competence is not started', function () {
      test('should return false', function (assert) {
        // given
        scorecard.status = 'NOT_STARTED';

        // when
        const isResettable = scorecard.isResettable;

        // then
        assert.equal(isResettable, false);
      });
    });

    module('when the competence is started', function () {
      module('when there are remaining days before reset', function () {
        test('should return false', function (assert) {
          // given
          scorecard.status = 'STARTED';
          scorecard.remainingDaysBeforeReset = 2;

          // when
          const isResettable = scorecard.isResettable;

          // then
          assert.equal(isResettable, false);
        });
      });

      module('when there are no remaining days before reset', function () {
        test('should return true', function (assert) {
          // given
          scorecard.status = 'STARTED';
          scorecard.remainingDaysBeforeReset = 0;

          // when
          const isResettable = scorecard.isResettable;

          // then
          assert.equal(isResettable, true);
        });
      });
    });

    module('when the competence is finished', function () {
      module('when there are remaining days before reset', function () {
        test('should return true', function (assert) {
          // given
          scorecard.status = 'COMPLETED';
          scorecard.remainingDaysBeforeReset = 1;

          // when
          const isResettable = scorecard.isResettable;

          // then
          assert.equal(isResettable, false);
        });
      });

      module('when there are no remaining days before reset', function () {
        test('should return false', function (assert) {
          // given
          scorecard.status = 'COMPLETED';
          scorecard.remainingDaysBeforeReset = 0;

          // when
          const isResettable = scorecard.isResettable;

          // then
          assert.equal(isResettable, true);
        });
      });
    });
  });

  module('hasNotEarnAnything', function () {
    test('should return true', function (assert) {
      // given
      scorecard.earnedPix = 0;

      // when
      const hasNotEarnAnything = scorecard.hasNotEarnAnything;

      // then
      assert.equal(hasNotEarnAnything, true);
    });

    test('should return false', function (assert) {
      // given
      scorecard.earnedPix = 2;

      // when
      const hasNotEarnAnything = scorecard.hasNotEarnAnything;

      // then
      assert.equal(hasNotEarnAnything, false);
    });
  });

  module('hasNotReachLevelOne', function () {
    test('should return true', function (assert) {
      // given
      scorecard.level = 0;

      // when
      const hasNotReachLevelOne = scorecard.hasNotReachLevelOne;

      // then
      assert.equal(hasNotReachLevelOne, true);
    });

    test('should return false if level is 1', function (assert) {
      // given
      scorecard.level = 1;

      // when
      const hasNotReachLevelOne = scorecard.hasNotReachLevelOne;

      // then
      assert.equal(hasNotReachLevelOne, false);
    });

    test('should return false if level > 1', function (assert) {
      // given
      scorecard.level = 2;

      // when
      const hasNotReachLevelOne = scorecard.hasNotReachLevelOne;

      // then
      assert.equal(hasNotReachLevelOne, false);
    });
  });

  module('hasReachAtLeastLevelOne', function () {
    test('should return true if level is 1', function (assert) {
      // given
      scorecard.level = 1;

      // when
      const hasReachAtLeastLevelOne = scorecard.hasReachAtLeastLevelOne;

      // then
      assert.equal(hasReachAtLeastLevelOne, true);
    });

    test('should return true if level is 4', function (assert) {
      // given
      scorecard.level = 4;

      // when
      const hasReachAtLeastLevelOne = scorecard.hasReachAtLeastLevelOne;

      // then
      assert.equal(hasReachAtLeastLevelOne, true);
    });

    test('should return false', function (assert) {
      // given
      scorecard.level = 0;

      // when
      const hasReachAtLeastLevelOne = scorecard.hasReachAtLeastLevelOne;

      // then
      assert.equal(hasReachAtLeastLevelOne, false);
    });
  });
});
