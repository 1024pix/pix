import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | references', function (hooks) {
  setupTest(hooks);

  module('#availableLanguages', function () {
    test('returns the list of available languages', function (assert) {
      // given
      const references = this.owner.lookup('service:references');

      // then
      assert.strictEqual(references.availableLanguages.length, 4);
      assert.deepEqual(references.availableLanguages, [
        { value: 'fr', label: 'Français' },
        { value: 'en', label: 'Anglais' },
        { value: 'nl', label: 'Néerlandais' },
        { value: 'es', label: 'Espagnol' },
      ]);
    });
  });

  module('#availableLocales', function () {
    test('returns the list of available locales', function (assert) {
      // given
      const references = this.owner.lookup('service:references');

      // then
      assert.strictEqual(references.availableLocales.length, 5);
      assert.deepEqual(references.availableLocales, [
        { value: 'en', label: 'en' },
        { value: 'fr', label: 'fr' },
        { value: 'fr-BE', label: 'fr-BE' },
        { value: 'fr-FR', label: 'fr-FR' },
        { value: 'nl-BE', label: 'nl-BE' },
      ]);
    });
  });
});
