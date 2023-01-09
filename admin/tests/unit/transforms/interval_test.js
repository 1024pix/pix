import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import IntervalTransform from 'pix-admin/transforms/interval';

module('Unit | Transform | interval', function (hooks) {
  setupTest(hooks);

  module('#serialize', function () {
    test('should return null when interval is undefined', function (assert) {
      // given
      const transform = IntervalTransform.create();
      const interval = undefined;

      // when
      const serialized = transform.serialize(interval);

      // then
      assert.strictEqual(serialized, null);
    });

    module('should return formatted interval', function () {
      test('should return 0d0h0m when interval is empty object', function (assert) {
        // given
        const transform = IntervalTransform.create();
        const interval = {};

        // when
        const serialized = transform.serialize(interval);

        // then
        assert.strictEqual(serialized, '0d0h0m');
      });

      test('should return formatted interval when the interval is valid', function (assert) {
        // given
        const transform = IntervalTransform.create();
        const interval = {
          days: 1,
          hours: 1,
          minutes: 1,
        };

        // when
        const serialized = transform.serialize(interval);

        // then
        assert.strictEqual(serialized, '1d1h1m');
      });
    });
  });
});
