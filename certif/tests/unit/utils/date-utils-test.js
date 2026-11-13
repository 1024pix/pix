import { addMinutes } from 'pix-certif/utils/date-utils';
import { module, test } from 'qunit';

module('Unit | Utility | date-utils', function () {
  module('#addMinutes', function () {
    test('should add the given minutes to the date', function (assert) {
      // given
      const date = new Date('2020-01-01T14:30:00Z');

      // when
      const result = addMinutes(date, 90);

      // then
      assert.deepEqual(result, new Date('2020-01-01T16:00:00Z'));
    });

    test('should go to the next day when crossing midnight', function (assert) {
      // given
      const date = new Date('2020-12-31T23:30:00Z');

      // when
      const result = addMinutes(date, 45);

      // then
      assert.deepEqual(result, new Date('2021-01-01T00:15:00Z'));
    });

    test('should not mutate the given date', function (assert) {
      // given
      const date = new Date('2020-01-01T14:30:00Z');

      // when
      addMinutes(date, 90);

      // then
      assert.deepEqual(date, new Date('2020-01-01T14:30:00Z'));
    });
  });
});
