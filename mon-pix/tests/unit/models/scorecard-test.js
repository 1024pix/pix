import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { run } from '@ember/runloop';

describe('Unit | Model | Scorecard model', function() {
  let scorecard;

  setupTest();

  beforeEach(function() {
    scorecard = run(() => this.owner.lookup('service:store').createRecord('scorecard'));
  });

  describe('percentageAheadOfNextLevel', function() {
    [
      { pixScoreAheadOfNextLevel: 0, expectedPercentageAheadOfNextLevel: 0 },
      { pixScoreAheadOfNextLevel: 4, expectedPercentageAheadOfNextLevel: 50 },
      { pixScoreAheadOfNextLevel: 3.33, expectedPercentageAheadOfNextLevel: 41.625 },
      { pixScoreAheadOfNextLevel: 7.8, expectedPercentageAheadOfNextLevel: 95 }
    ].forEach((data) => {
      it(`should return ${data.expectedPercentageAheadOfNextLevel} when pixScoreAheadOfNextLevel is ${data.pixScoreAheadOfNextLevel}`, function() {
        // given
        scorecard.set('pixScoreAheadOfNextLevel', data.pixScoreAheadOfNextLevel);

        // when
        const percentageAheadOfNextLevel = scorecard.percentageAheadOfNextLevel;

        // then
        expect(percentageAheadOfNextLevel).to.equal(data.expectedPercentageAheadOfNextLevel);
      });
    });
  });

  describe('remainingPixToNextLevel', function() {
    it('should return 2 remaining Pix to next level', function() {
      // given
      scorecard.set('pixScoreAheadOfNextLevel', 3);

      // when
      const remainingPixToNextLevel = scorecard.remainingPixToNextLevel;

      // then
      expect(remainingPixToNextLevel).to.equal(5);
    });
  });

  describe('isMaxLevel', function() {
    it('should return true', function() {
      // given
      scorecard.set('level', 5);

      // when
      const isMaxLevel = scorecard.get('isMaxLevel');

      // then
      expect(isMaxLevel).to.be.true;
    });

    it('should return false', function() {
      // given
      scorecard.set('level', 2);

      // when
      const isMaxLevel = scorecard.get('isMaxLevel');

      // then
      expect(isMaxLevel).to.be.false;
    });
  });

  describe('hasNotEarnAnything', function() {
    it('should return true', function() {
      // given
      scorecard.set('earnedPix', 0);

      // when
      const hasNotEarnAnything = scorecard.get('hasNotEarnAnything');

      // then
      expect(hasNotEarnAnything).to.be.true;
    });

    it('should return false', function() {
      // given
      scorecard.set('earnedPix', 2);

      // when
      const hasNotEarnAnything = scorecard.get('hasNotEarnAnything');

      // then
      expect(hasNotEarnAnything).to.be.false;
    });

    describe('hasNotReachLevelOne', function() {
      it('should return true', function() {
        // given
        scorecard.set('level', 0);

        // when
        const hasNotReachLevelOne = scorecard.get('hasNotReachLevelOne');

        // then
        expect(hasNotReachLevelOne).to.be.true;
      });

      it('should return false if level is 1', function() {
        // given
        scorecard.set('level', 1);

        // when
        const hasNotReachLevelOne = scorecard.get('hasNotReachLevelOne');

        // then
        expect(hasNotReachLevelOne).to.be.false;
      });

      it('should return false if level > 1', function() {
        // given
        scorecard.set('level', 2);

        // when
        const hasNotReachLevelOne = scorecard.get('hasNotReachLevelOne');

        // then
        expect(hasNotReachLevelOne).to.be.false;
      });
    });
  });

  describe('areaColor', function() {
    [
      { code: 1, expectedColor: 'jaffa' },
      { code: 2, expectedColor: 'emerald' },
      { code: 3, expectedColor: 'cerulean' },
      { code: 4, expectedColor: 'wild-strawberry' },
      { code: 5, expectedColor: 'butterfly-bush' }
    ].forEach((data) => {
      it(`should return ${data.expectedColor} when area.code is ${data.code}`, function() {
        // given
        const area = run(() => this.owner.lookup('service:store').createRecord('area', {
          code: data.code,
        }));
        scorecard.set('area', area);

        // when
        const areaColor = scorecard.areaColor;

        // then
        expect(areaColor).to.equal(data.expectedColor);
      });
    });
  });
});
