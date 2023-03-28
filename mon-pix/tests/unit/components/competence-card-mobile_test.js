import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | competence-card-mobile', function (hooks) {
  setupTest(hooks);

  module('#displayedLevel', function () {
    [
      { level: null, isNotStarted: true, expectedLevel: null },
      { level: 1, isNotStarted: false, expectedLevel: 1 },
      { level: 0, isNotStarted: false, expectedLevel: 0 },
      { level: 3, isNotStarted: false, expectedLevel: 3 },
    ].forEach((data) => {
      test(`should return ${data.expectedLevel} when level is ${data.level} and isNotStarted is ${data.isNotStarted}`, function (assert) {
        // given
        const scorecard = { isNotStarted: data.isNotStarted, level: data.level };
        const component = createGlimmerComponent('component:competence-card-mobile', { scorecard });

        // when
        const displayedLevel = component.displayedLevel;

        // then
        assert.strictEqual(displayedLevel, data.expectedLevel);
      });
    });
  });
});
