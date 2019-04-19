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
      { pixScoreAheadOfNextLevel: 0, expectedPercentageAheadOfNextLevel: 0 },
      { pixScoreAheadOfNextLevel: 4, expectedPercentageAheadOfNextLevel: 50 },
      { pixScoreAheadOfNextLevel: 3.33, expectedPercentageAheadOfNextLevel: 41.625 },
      { pixScoreAheadOfNextLevel: 7.8, expectedPercentageAheadOfNextLevel: 95 }
    ].forEach((data) => {

      it(`should return ${data.expectedPercentageAheadOfNextLevel} when pixScoreAheadOfNextLevel is ${data.pixScoreAheadOfNextLevel}`, function() {
        // given
        const scorecard = { pixScoreAheadOfNextLevel: data.pixScoreAheadOfNextLevel };
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
      { level: null, isNotStarted: true, expectedLevel: null },
      { level: 1, isNotStarted: false, expectedLevel: 1 },
      { level: 0, isNotStarted: false, expectedLevel: '–' },
      { level: 0, isNotStarted: false, expectedLevel: '–' },
      { level: 3, isNotStarted: false, expectedLevel: 3 }
    ].forEach((data) => {

      it(`should return ${data.expectedLevel} when level is ${data.level} and isNotStarted is ${data.isNotStarted}`, function() {
        // given
        const scorecard = { isNotStarted: data.isNotStarted, level: data.level };
        component.set('scorecard', scorecard);

        // when
        const displayedLevel = component.get('displayedLevel');

        // then
        expect(displayedLevel).to.equal(data.expectedLevel);
      });
    });
  });
});
