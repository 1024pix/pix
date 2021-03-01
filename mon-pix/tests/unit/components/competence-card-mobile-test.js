import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | competence-card-mobile', function() {

  setupTest();

  describe('#displayedLevel', function() {
    [
      { level: null, isNotStarted: true, expectedLevel: null },
      { level: 1, isNotStarted: false, expectedLevel: 1 },
      { level: 0, isNotStarted: false, expectedLevel: 0 },
      { level: 3, isNotStarted: false, expectedLevel: 3 },
    ].forEach((data) => {

      it(`should return ${data.expectedLevel} when level is ${data.level} and isNotStarted is ${data.isNotStarted}`, function() {
        // given
        const scorecard = { isNotStarted: data.isNotStarted, level: data.level };
        const component = createGlimmerComponent('component:competence-card-mobile', { scorecard });

        // when
        const displayedLevel = component.displayedLevel;

        // then
        expect(displayedLevel).to.equal(data.expectedLevel);
      });
    });
  });
});
