import { setupTest } from 'ember-qunit';
import parseISODateOnly from 'mon-pix/utils/parse-iso-date-only';
import { module, test } from 'qunit';

module('Unit | Utils | parse-iso-date-only', function (hooks) {
  setupTest(hooks);

  test('parse "2020-01-01" date only to ISO', function (assert) {
    // given
    const dateString = '2020-01-01';

    // when
    const date = parseISODateOnly(dateString);

    // then
    assert.deepEqual(date, new Date(2020, 0, 1));
  });

  test('parse "2020-12-31" date only to ISO', function (assert) {
    // given
    const dateString = '2020-12-31';

    // when
    const date = parseISODateOnly(dateString);

    // then
    assert.deepEqual(date, new Date(2020, 11, 31));
  });

  test('throws when the input date does not comply with the "YYYY-MM-DD" format', function (assert) {
    // given
    const dateStringWithInvertedDayAndMonth = '2020-31-12';

    // when / then
    assert.throws(() => parseISODateOnly(dateStringWithInvertedDayAndMonth));
  });
});
