import { formatShortDate, parseShortDate } from 'mon-pix/utils/localized-date';
import { module, test } from 'qunit';

module('Unit | Utils | localized-date', function () {
  module('formatShortDate', function () {
    [
      { locale: 'fr', expected: '31/12/2020' },
      { locale: 'en', expected: '12/31/2020' },
      { locale: 'de', expected: '31.12.2020' },
      { locale: 'nl', expected: '31-12-2020' },
    ].forEach(({ locale, expected }) => {
      test(`formats the date with the "${locale}" short format`, function (assert) {
        assert.strictEqual(formatShortDate(new Date(2020, 11, 31), locale), expected);
      });
    });
  });

  module('parseShortDate', function () {
    [
      { locale: 'fr', value: '05/03/2024' },
      { locale: 'en', value: '03/05/2024' },
      { locale: 'de', value: '05.03.2024' },
      { locale: 'nl', value: '05-03-2024' },
    ].forEach(({ locale, value }) => {
      test(`parses "${value}" in "${locale}"`, function (assert) {
        assert.strictEqual(parseShortDate(value, locale), '2024-03-05');
      });
    });

    ['5/3/2024', '05/03/24', '2024-03-05', '31/02/2024', '00/01/2024', '', null, undefined].forEach((value) => {
      test(`returns null for "${value}" in "fr"`, function (assert) {
        assert.strictEqual(parseShortDate(value, 'fr'), null);
      });
    });
  });
});
