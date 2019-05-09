import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | competence-card-component', function() {

  setupTest('component:competence-card', {});

  let component;

  beforeEach(function() {
    component = this.subject();
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
