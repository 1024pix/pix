import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | competence-card-component', function() {

  setupTest('component:competence-card', {});

  let component;

  beforeEach(function() {
    component = this.subject();
  });

  describe('#percentageAheadOfNextLevel', function() {
    [
      { remainingPixToNextLevel: 0, expectedPercentageAheadOfNextLevel: 0 },
      { remainingPixToNextLevel: 4, expectedPercentageAheadOfNextLevel: 50 },
      { remainingPixToNextLevel: 3.33, expectedPercentageAheadOfNextLevel: 41.625 },
      { remainingPixToNextLevel: 7.8, expectedPercentageAheadOfNextLevel: 95 }
    ].forEach((data) => {

      it(`should return ${data.expectedPercentageAheadOfNextLevel} when remainingPixToNextLevelis ${data.remainingPixToNextLevel}`, function() {
        // given
        const scorecard = { remainingPixToNextLevel: data.remainingPixToNextLevel };
        component.set('scorecard', scorecard);

        // when
        const percentageAheadOfNextLevel = component.get('percentageAheadOfNextLevel');

        // then
        expect(percentageAheadOfNextLevel).to.equal(data.expectedPercentageAheadOfNextLevel);
      });
    });
  });

  describe('#displayedLevel', function() {
    [
      { level: undefined, remainingPixToNextLevel: undefined, expectedLevel: null },
      { level: null, remainingPixToNextLevel: null, expectedLevel: null },
      { level: 0, remainingPixToNextLevel: 0, expectedLevel: null },
      { level: 1, remainingPixToNextLevel: 0, expectedLevel: 1 },
      { level: 0, remainingPixToNextLevel: 4, expectedLevel: '--' },
      { level: 3, remainingPixToNextLevel: 5, expectedLevel: 3 }
    ].forEach((data) => {

      it(`should return ${data.expectedLevel} when level is ${data.level} and remainingPixToNextLevelis ${data.remainingPixToNextLevel}`, function() {
        // given
        const scorecard = { remainingPixToNextLevel: data.remainingPixToNextLevel, level: data.level };
        component.set('scorecard', scorecard);

        // when
        const displayedLevel = component.get('displayedLevel');

        // then
        expect(displayedLevel).to.equal(data.expectedLevel);
      });
    });
  });
});
