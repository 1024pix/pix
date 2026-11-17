import { setupTest } from 'ember-qunit';
import formatDuration from 'pix-admin/helpers/format-duration';
import { module, test } from 'qunit';

module('Unit | Helper | format-duration', function (hooks) {
  setupTest(hooks);

  module('formatDuration', function () {
    [
      { duration: 1234, format: 'HH:mm:ss:SSS', expected: '00:00:01:234' },
      { duration: 12000, format: 'mm:ss', expected: '00:12' },
      { duration: 120000, format: 'HH:mm:ss', expected: '00:02:00' },
      { duration: 12000000, format: 'HH:mm:ss', expected: '03:20:00' },
      { duration: 12000000, format: 'HHhmm', expected: '03h20' },
      { duration: -12000000, format: 'HH:mm:ss', expected: '-03:20:00' },
    ].forEach(function ({ duration, format, expected }) {
      test(`formats ${duration}ms to ${format}`, async function (assert) {
        assert.strictEqual(formatDuration(duration, format), expected);
      });
    });
  });
});
