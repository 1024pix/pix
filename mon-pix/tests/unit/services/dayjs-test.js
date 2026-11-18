import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | dayjs', function (hooks) {
  setupTest(hooks);

  let dayjsService;

  hooks.beforeEach(function () {
    dayjsService = this.owner.lookup('service:dayjs');
  });

  hooks.afterEach(function () {
    dayjsService.setLocale('en');
  });

  module('#setLocale', function () {
    test('sets the given locale', function (assert) {
      // when
      dayjsService.setLocale('fr');

      // then
      assert.strictEqual(dayjsService.locale, 'fr');
    });
  });

  module('#format', function () {
    test('formats a date with the current locale', function (assert) {
      // given
      dayjsService.setLocale('fr');

      // when
      const result = dayjsService.format('2024-03-05', 'D MMMM YYYY');

      // then
      assert.strictEqual(result, '5 mars 2024');
    });

    test('formats a date with a numeric format', function (assert) {
      // when
      const result = dayjsService.format('2024-03-05', 'DD/MM/YYYY');

      // then
      assert.strictEqual(result, '05/03/2024');
    });
  });

  module('#humanizeDuration', function () {
    ['de', 'en', 'es', 'fr', 'it', 'nl'].forEach((locale) => {
      test(`humanizes a duration in "${locale}"`, function (assert) {
        // given
        dayjsService.setLocale(locale);

        // when
        const result = dayjsService.humanizeDuration(3600, 'seconds');

        // then
        assert.notStrictEqual(result, '');
        assert.strictEqual(dayjsService.locale, locale);
      });
    });

    test('humanizes a duration with the current locale', function (assert) {
      // given
      dayjsService.setLocale('fr');

      // when
      const result = dayjsService.humanizeDuration(3600, 'seconds');

      // then
      assert.strictEqual(result, 'une heure');
    });
  });
});
