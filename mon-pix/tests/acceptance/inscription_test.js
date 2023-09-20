import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { click, currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Inscription', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('International domain (.org)', function () {
    module('when accessing the inscription page with "Français" as default language', function () {
      test('displays the inscription page with "Français" as selected language', async function (assert) {
        // given & when
        const screen = await visit('/inscription');

        // then
        assert.strictEqual(currentURL(), '/inscription');
        assert.dom(screen.getByRole('heading', { name: 'Inscrivez-vous', level: 1 })).exists();
        assert.dom(screen.getByRole('button', { name: 'Français' })).exists();
      });

      module('when the user select "English" as his language', function () {
        test('displays the inscription page with "English" as selected language', async function (assert) {
          // given & when
          const screen = await visit('/inscription');
          await click(screen.getByRole('button', { name: 'Français' }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: 'English' }));

          // then
          assert.strictEqual(currentURL(), '/inscription');
          assert.dom(screen.getByRole('heading', { name: 'Sign up', level: 1 })).exists();
          assert.dom(screen.getByRole('button', { name: 'English' })).exists();
        });
      });
    });

    module('when accessing the inscription page with "English" as selected language', function () {
      test('displays the inscription page with "English"', async function (assert) {
        // given && when
        const screen = await visit('/inscription?lang=en');

        // then
        assert.strictEqual(currentURL(), '/inscription?lang=en');
        assert.dom(screen.getByRole('heading', { name: 'Sign up', level: 1 })).exists();
        assert.dom(screen.getByRole('button', { name: 'English' })).exists();
      });

      module('when the user select "Français" as his language', function () {
        test('displays the inscription page with "Français" as selected language', async function (assert) {
          // given & when
          const screen = await visit('/inscription?lang=en');
          await click(screen.getByRole('button', { name: 'English' }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: 'Français' }));

          // then
          assert.strictEqual(currentURL(), '/inscription');
          assert.dom(screen.getByRole('heading', { name: 'Inscrivez-vous', level: 1 })).exists();
          assert.dom(screen.getByRole('button', { name: 'Français' })).exists();
        });
      });
    });
  });
});
