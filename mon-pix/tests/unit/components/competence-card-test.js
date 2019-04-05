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

      it(`should return "${data.expectedPercentageAheadOfNextLevel}" when pixScoreAheadOfNextLevel is ${data.pixScoreAheadOfNextLevel}`, function() {
        // given
        component.set('pixScoreAheadOfNextLevel', data.pixScoreAheadOfNextLevel);

        // when
        const percentageAheadOfNextLevel = component.get('percentageAheadOfNextLevel');

        // then
        expect(percentageAheadOfNextLevel).to.equal(data.expectedPercentageAheadOfNextLevel);
      });
    });
  });

  describe('#displayedLevel', function() {
    [
      { level: undefined, pixScoreAheadOfNextLevel: undefined, expectedLevel: '&nbsp;' },
      { level: null, pixScoreAheadOfNextLevel: null, expectedLevel: '&nbsp;' },
      { level: 0, pixScoreAheadOfNextLevel: 0, expectedLevel: '&nbsp;' },
      { level: 1, pixScoreAheadOfNextLevel: 0, expectedLevel: 1 },
      { level: 0, pixScoreAheadOfNextLevel: 4, expectedLevel: '--' },
      { level: 3, pixScoreAheadOfNextLevel: 5, expectedLevel: 3 }
    ].forEach((data) => {

      it(`should return "${data.expectedLevel}" when level is ${data.level} and pixScoreAheadOfNextLevel is ${data.pixScoreAheadOfNextLevel}`, function() {
        // given
        component.set('pixScoreAheadOfNextLevel', data.pixScoreAheadOfNextLevel);
        component.set('level', data.level);

        // when
        const displayedLevel = component.get('displayedLevel');

        // then
        expect(displayedLevel.string || displayedLevel).to.equal(data.expectedLevel);
      });
    });
  });
});
