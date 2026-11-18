import { humanizeDuration } from 'mon-pix/helpers/humanize-duration';
import { module, test } from 'qunit';

// Intl may separate the value from the unit with a non-breaking space
const normalizeSpaces = (value) => value.replace(/\s/g, ' ');

module('Unit | Helper | humanize-duration', function () {
  [
    { duration: 0, expected: '1 seconde' },
    { duration: 30, expected: '30 secondes' },
    { duration: 45, expected: '1 minute' },
    { duration: 60, expected: '1 minute' },
    { duration: 330, expected: '6 minutes' },
    { duration: 2700, expected: '1 heure' },
    { duration: 7200, expected: '2 heures' },
    { duration: 172800, expected: '2 jours' },
  ].forEach(({ duration, expected }) => {
    test(`formats ${duration} seconds as "${expected}" in French`, function (assert) {
      assert.strictEqual(normalizeSpaces(humanizeDuration(duration, 'fr')), expected);
    });
  });

  test('formats the duration in the given locale', function (assert) {
    assert.strictEqual(normalizeSpaces(humanizeDuration(330, 'en')), '6 minutes');
    assert.strictEqual(normalizeSpaces(humanizeDuration(7200, 'de')), '2 Stunden');
  });

  test('accepts a duration given as a string', function (assert) {
    assert.strictEqual(normalizeSpaces(humanizeDuration('60', 'fr')), '1 minute');
  });
});
