import { setupTest } from 'ember-qunit';
import { formatUtcDate } from 'pix-certif/helpers/format-utc-date';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Unit | Helpers | format-utc-date', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'fr');

  test('should format the date in UTC with the L format by default', function (assert) {
    // given
    const intl = this.owner.lookup('service:intl');

    // when
    const result = formatUtcDate(intl, '2020-12-01T23:30:00Z');

    // then
    assert.strictEqual(result, '01/12/2020');
  });

  test('should format the date with the given format', function (assert) {
    // given
    const intl = this.owner.lookup('service:intl');

    // when
    const result = formatUtcDate(intl, '2020-12-01', { format: 'LL' });

    // then
    assert.strictEqual(result, '1 décembre 2020');
  });

  test('should return an empty string when date is missing', function (assert) {
    // given
    const intl = this.owner.lookup('service:intl');

    // when
    const result = formatUtcDate(intl, null);

    // then
    assert.strictEqual(result, '');
  });
});
