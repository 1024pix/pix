import { module, test } from 'qunit';
import { formatDate } from 'pix-admin/helpers/format-date';

module('Unit | Helpers | formatDate', function () {
  test('it should return null if the given value is null', function (assert) {
    // given
    const date = null;

    // when
    const value = formatDate([date]);

    // then
    assert.strictEqual(value, null);
  });

  test('it should return formatted date', function (assert) {
    // given
    const date = new Date('2020-08-14T00:00:00Z');

    // when
    const value = formatDate([date]);

    // then
    assert.strictEqual(value, '14/08/2020');
  });
});
