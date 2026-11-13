import { formatSessionTime } from 'pix-certif/helpers/format-session-time';
import { module, test } from 'qunit';

module('Unit | Helpers | format-session-time', function () {
  test('should return the time without seconds', function (assert) {
    // when
    const result = formatSessionTime(['14:30:00']);

    // then
    assert.strictEqual(result, '14:30');
  });

  test('should return an empty string when time is missing', function (assert) {
    // when
    const result = formatSessionTime([null]);

    // then
    assert.strictEqual(result, '');
  });
});
