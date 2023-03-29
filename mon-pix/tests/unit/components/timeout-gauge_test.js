import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | timeout-gauge-component ', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:timeout-gauge');
  });

  module('#Test rendering Property', function () {
    module('#formattedRemainingTime', function () {
      [
        { remainingSeconds: 0, expected: '0:00' },
        { remainingSeconds: 120, expected: '2:00' },
        { remainingSeconds: 90, expected: '1:30' },
        { remainingSeconds: 60, expected: '1:00' },
      ].forEach((data) => {
        test(`should return "${data.expected}" when remainingSeconds is ${data.remainingSeconds}s`, function (assert) {
          // given
          component.remainingSeconds = data.remainingSeconds;

          // when
          const formattedRemainingTime = component.formattedRemainingTime;

          // then
          assert.strictEqual(formattedRemainingTime, data.expected);
        });
      });
    });

    module('#percentageOfTimeout', function () {
      [
        { allottedTime: new Date(), remainingSeconds: 40, expected: 0 },
        { allottedTime: '  ', remainingSeconds: 40, expected: 0 },
        { allottedTime: undefined, remainingSeconds: 40, expected: 0 },
        { allottedTime: null, remainingSeconds: 40, expected: 0 },
        { allottedTime: '0', remainingSeconds: 40, expected: 0 },
        { allottedTime: '40', remainingSeconds: 40, expected: 0 },
        { allottedTime: '70', remainingSeconds: 35, expected: 50 },
        { allottedTime: '120', remainingSeconds: 0, expected: 100 },
      ].forEach((data) => {
        test(`should return ${data.expected}% when allotting ${data.allottedTime}s and remainingSeconds is ${data.remainingSeconds}s`, function (assert) {
          // given
          component.args.allottedTime = data.allottedTime;
          component.remainingSeconds = data.remainingSeconds;

          // when
          const percentageOfTimeout = component.percentageOfTimeout;

          // then
          assert.strictEqual(percentageOfTimeout, data.expected);
        });
      });
    });
  });
});
