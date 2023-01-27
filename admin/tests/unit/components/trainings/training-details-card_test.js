import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import createComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Trainings | training-details-card', function (hooks) {
  setupTest(hooks);

  module('formattedDuration', function () {
    [
      { duration: { days: 2 }, expectedResult: '2j' },
      { duration: { hours: 2 }, expectedResult: '2h' },
      { duration: { minutes: 2 }, expectedResult: '2min' },
      { duration: { hours: 10, minutes: 2 }, expectedResult: '10h 2min' },
      { duration: { days: 1, hours: 4 }, expectedResult: '1j 4h' },
      { duration: { days: 1, minutes: 30 }, expectedResult: '1j 30min' },
      { duration: { days: 1, hours: 4, minutes: 30 }, expectedResult: '1j 4h 30min' },
    ].forEach(function ({ duration, expectedResult }) {
      test(`${JSON.stringify(duration)} should return ${expectedResult}`, function (assert) {
        // given & when
        const component = createComponent('component:trainings/training-details-card');
        component.args = {
          training: { duration },
        };

        // then
        assert.strictEqual(component.formattedDuration, expectedResult);
      });
    });
  });
});
