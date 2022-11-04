import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { run } from '@ember/runloop';
import ENV from 'mon-pix/config/environment';

describe('Unit | Model | Scorecard model', function () {
  const maxReachableLevel = ENV.APP.MAX_REACHABLE_LEVEL;
  let scorecard;

  setupTest();

  beforeEach(function () {
    scorecard = run(() => this.owner.lookup('service:store').createRecord('scorecard'));
  });

  describe('percentageAheadOfNextLevel', function () {
    [
      { pixScoreAheadOfNextLevel: 0, expectedPercentageAheadOfNextLevel: 0 },
      { pixScoreAheadOfNextLevel: 4, expectedPercentageAheadOfNextLevel: 50 },
      { pixScoreAheadOfNextLevel: 3.33, expectedPercentageAheadOfNextLevel: 41.625 },
      { pixScoreAheadOfNextLevel: 7.8, expectedPercentageAheadOfNextLevel: 95 },
    ].forEach((data) => {
      it(`should return ${data.expectedPercentageAheadOfNextLevel} when pixScoreAheadOfNextLevel is ${data.pixScoreAheadOfNextLevel}`, function () {
        // given
        scorecard.pixScoreAheadOfNextLevel = data.pixScoreAheadOfNextLevel;

        // when
        const percentageAheadOfNextLevel = scorecard.percentageAheadOfNextLevel;

        // then
        expect(percentageAheadOfNextLevel).to.equal(data.expectedPercentageAheadOfNextLevel);
      });
    });
  });

  describe('remainingPixToNextLevel', function () {
    it('should return 2 remaining Pix to next level', function () {
      // given
      scorecard.pixScoreAheadOfNextLevel = 3;

      // when
      const remainingPixToNextLevel = scorecard.remainingPixToNextLevel;

      // then
      expect(remainingPixToNextLevel).to.equal(5);
    });
  });

  describe('isMaxLevel', function () {
    it('should return true', function () {
      // given
      scorecard.level = maxReachableLevel;

      // when
      const isMaxLevel = scorecard.isMaxLevel;

      // then
      expect(isMaxLevel).to.be.true;
    });

    it('should return false', function () {
      // given
      scorecard.level = 2;

      // when
      const isMaxLevel = scorecard.isMaxLevel;

      // then
      expect(isMaxLevel).to.be.false;
    });
  });

  describe('isFinishedWithMaxLevel', function () {
    context('when max level is reached', function () {
      it('should return true', function () {
        // given
        scorecard.level = maxReachableLevel;
        scorecard.status = 'COMPLETED';

        // when
        const isFinishedWithMaxLevel = scorecard.isFinishedWithMaxLevel;

        // then
        expect(isFinishedWithMaxLevel).to.be.true;
      });

      it('should return false', function () {
        // given
        scorecard.level = maxReachableLevel;
        scorecard.status = 'STARTED';

        // when
        const isFinishedWithMaxLevel = scorecard.isFinishedWithMaxLevel;

        // then
        expect(isFinishedWithMaxLevel).to.be.false;
      });
    });

    context('when max level is not reached', function () {
      it('should return true', function () {
        // given
        scorecard.level = 3;
        scorecard.status = 'COMPLETED';

        // when
        const isFinishedWithMaxLevel = scorecard.isFinishedWithMaxLevel;

        // then
        expect(isFinishedWithMaxLevel).to.be.false;
      });

      it('should return false', function () {
        // given
        scorecard.level = 3;
        scorecard.status = 'STARTED';

        // when
        const isFinishedWithMaxLevel = scorecard.isFinishedWithMaxLevel;

        // then
        expect(isFinishedWithMaxLevel).to.be.false;
      });
    });
  });

  describe('isProgressable', function () {
    context('when the competence is finished', function () {
      it('should return false', function () {
        // given
        scorecard.status = 'COMPLETED';

        // when
        const isProgressable = scorecard.isProgressable;

        // then
        expect(isProgressable).to.be.false;
      });
    });

    context('when the competence is not started', function () {
      it('should return false', function () {
        // given
        scorecard.status = 'NOT_STARTED';

        // when
        const isProgressable = scorecard.isProgressable;

        // then
        expect(isProgressable).to.be.false;
      });
    });

    context('when the competence is started', function () {
      context('and max level is reached', function () {
        it('should return false', function () {
          // given
          scorecard.level = maxReachableLevel;
          scorecard.status = 'STARTED';

          // when
          const isProgressable = scorecard.isProgressable;

          // then
          expect(isProgressable).to.be.false;
        });
      });

      context('when max level is not reached', function () {
        it('should return true', function () {
          // given
          scorecard.level = 1;
          scorecard.status = 'STARTED';

          // when
          const isProgressable = scorecard.isProgressable;

          // then
          expect(isProgressable).to.be.true;
        });
      });
    });
  });

  describe('isImprovable', function () {
    context('when the competence is finished with max level', function () {
      it('should return false', function () {
        // given
        scorecard.level = maxReachableLevel;
        scorecard.status = 'COMPLETED';
        scorecard.remainingDaysBeforeImproving = 0;

        // when
        const isImprovable = scorecard.isImprovable;

        // then
        expect(isImprovable).to.be.false;
      });
    });

    context('when the competence is not finished', function () {
      it('should return false', function () {
        // given
        scorecard.level = maxReachableLevel;
        scorecard.status = 'STARTED';
        scorecard.remainingDaysBeforeImproving = 0;

        // when
        const isImprovable = scorecard.isImprovable;

        // then
        expect(isImprovable).to.be.false;
      });
    });

    context('when there are remaining days before improving', function () {
      it('should return false', function () {
        // given
        scorecard.level = maxReachableLevel;
        scorecard.status = 'COMPLETED';
        scorecard.remainingDaysBeforeImproving = 1;

        // when
        const isImprovable = scorecard.isImprovable;

        // then
        expect(isImprovable).to.be.false;
      });
    });

    context(
      'when the competence is finished without reaching the max level and there are no remaining days before improving',
      function () {
        it('should return true', function () {
          // given
          scorecard.level = 3;
          scorecard.status = 'COMPLETED';
          scorecard.remainingDaysBeforeImproving = 0;

          // when
          const isImprovable = scorecard.isImprovable;

          // then
          expect(isImprovable).to.be.true;
        });
      }
    );
  });

  describe('shouldWaitBeforeImproving', function () {
    context('when the competence is not started', function () {
      it('should return false', function () {
        // given
        scorecard.status = 'NOT_STARTED';

        // when
        const shouldWaitBeforeImproving = scorecard.shouldWaitBeforeImproving;

        // then
        expect(shouldWaitBeforeImproving).to.be.false;
      });
    });

    context('when the competence is started', function () {
      it('should return false', function () {
        // given
        scorecard.status = 'STARTED';

        // when
        const shouldWaitBeforeImproving = scorecard.shouldWaitBeforeImproving;

        // then
        expect(shouldWaitBeforeImproving).to.be.false;
      });
    });

    context('when the competence is finished', function () {
      beforeEach(function () {
        scorecard.status = 'COMPLETED';
      });

      context('when the max level is reached', function () {
        it('should return false', function () {
          // given
          scorecard.level = maxReachableLevel;

          // when
          const shouldWaitBeforeImproving = scorecard.shouldWaitBeforeImproving;

          // then
          expect(shouldWaitBeforeImproving).to.be.false;
        });
      });

      context('when the max level is not reached', function () {
        context('when there are remaining days before improving', function () {
          it('should return true', function () {
            // given
            scorecard.level = 2;
            scorecard.remainingDaysBeforeImproving = 1;

            // when
            const shouldWaitBeforeImproving = scorecard.shouldWaitBeforeImproving;

            // then
            expect(shouldWaitBeforeImproving).to.be.true;
          });
        });

        context('when there are no remaining days before improving', function () {
          it('should return false', function () {
            // given
            scorecard.level = 2;
            scorecard.remainingDaysBeforeImproving = 0;

            // when
            const shouldWaitBeforeImproving = scorecard.shouldWaitBeforeImproving;

            // then
            expect(shouldWaitBeforeImproving).to.be.false;
          });
        });
      });
    });
  });

  describe('isResettable', function () {
    context('when the competence is not started', function () {
      it('should return false', function () {
        // given
        scorecard.status = 'NOT_STARTED';

        // when
        const isResettable = scorecard.isResettable;

        // then
        expect(isResettable).to.be.false;
      });
    });

    context('when the competence is started', function () {
      context('when there are remaining days before reset', function () {
        it('should return false', function () {
          // given
          scorecard.status = 'STARTED';
          scorecard.remainingDaysBeforeReset = 2;

          // when
          const isResettable = scorecard.isResettable;

          // then
          expect(isResettable).to.be.false;
        });
      });

      context('when there are no remaining days before reset', function () {
        it('should return true', function () {
          // given
          scorecard.status = 'STARTED';
          scorecard.remainingDaysBeforeReset = 0;

          // when
          const isResettable = scorecard.isResettable;

          // then
          expect(isResettable).to.be.true;
        });
      });
    });

    context('when the competence is finished', function () {
      context('when there are remaining days before reset', function () {
        it('should return true', function () {
          // given
          scorecard.status = 'COMPLETED';
          scorecard.remainingDaysBeforeReset = 1;

          // when
          const isResettable = scorecard.isResettable;

          // then
          expect(isResettable).to.be.false;
        });
      });

      context('when there are no remaining days before reset', function () {
        it('should return false', function () {
          // given
          scorecard.status = 'COMPLETED';
          scorecard.remainingDaysBeforeReset = 0;

          // when
          const isResettable = scorecard.isResettable;

          // then
          expect(isResettable).to.be.true;
        });
      });
    });
  });

  describe('hasNotEarnAnything', function () {
    it('should return true', function () {
      // given
      scorecard.earnedPix = 0;

      // when
      const hasNotEarnAnything = scorecard.hasNotEarnAnything;

      // then
      expect(hasNotEarnAnything).to.be.true;
    });

    it('should return false', function () {
      // given
      scorecard.earnedPix = 2;

      // when
      const hasNotEarnAnything = scorecard.hasNotEarnAnything;

      // then
      expect(hasNotEarnAnything).to.be.false;
    });
  });

  describe('hasNotReachLevelOne', function () {
    it('should return true', function () {
      // given
      scorecard.level = 0;

      // when
      const hasNotReachLevelOne = scorecard.hasNotReachLevelOne;

      // then
      expect(hasNotReachLevelOne).to.be.true;
    });

    it('should return false if level is 1', function () {
      // given
      scorecard.level = 1;

      // when
      const hasNotReachLevelOne = scorecard.hasNotReachLevelOne;

      // then
      expect(hasNotReachLevelOne).to.be.false;
    });

    it('should return false if level > 1', function () {
      // given
      scorecard.level = 2;

      // when
      const hasNotReachLevelOne = scorecard.hasNotReachLevelOne;

      // then
      expect(hasNotReachLevelOne).to.be.false;
    });
  });

  describe('hasReachAtLeastLevelOne', function () {
    it('should return true if level is 1', function () {
      // given
      scorecard.level = 1;

      // when
      const hasReachAtLeastLevelOne = scorecard.hasReachAtLeastLevelOne;

      // then
      expect(hasReachAtLeastLevelOne).to.be.true;
    });

    it('should return true if level is 4', function () {
      // given
      scorecard.level = 4;

      // when
      const hasReachAtLeastLevelOne = scorecard.hasReachAtLeastLevelOne;

      // then
      expect(hasReachAtLeastLevelOne).to.be.true;
    });

    it('should return false', function () {
      // given
      scorecard.level = 0;

      // when
      const hasReachAtLeastLevelOne = scorecard.hasReachAtLeastLevelOne;

      // then
      expect(hasReachAtLeastLevelOne).to.be.false;
    });
  });
});
