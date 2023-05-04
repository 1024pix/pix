import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { click, currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Login', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, ['fr', 'en']);

  module('when current url does not contain french tld (.fr)', function () {
    module('when accessing the login page with "Français" as default language', function () {
      test('displays the login page with "Français" as selected language', async function (assert) {
        // when
        const screen = await visit('/connexion');

        // then
        assert.strictEqual(currentURL(), '/connexion');
        assert.dom(screen.getByRole('heading', { name: 'Connectez-vous', level: 1 })).exists();
      });

      module('when the user select "English" as his language', function () {
        test('displays the login page with "English" as selected language', async function (assert) {
          // when
          const screen = await visit('/connexion');
          await click(screen.getByRole('button', { name: 'Français' }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: 'English' }));

          // then
          assert.strictEqual(currentURL(), '/connexion');
          assert.dom(screen.getByRole('heading', { name: 'Log in', level: 1 })).exists();
        });
      });
    });

    module('when accessing the login page with "English" as selected language', function () {
      test('displays the login page with "English"', async function (assert) {
        // when
        const screen = await visit('/connexion?lang=en');

        // then
        assert.strictEqual(currentURL(), '/connexion?lang=en');
        assert.dom(screen.getByRole('heading', { name: 'Log in', level: 1 })).exists();
      });

      module('when the user select "Français" as his language', function () {
        test('displays the login page with "Français" as selected language', async function (assert) {
          // given & when
          const screen = await visit('/connexion?lang=en');
          await click(screen.getByRole('button', { name: 'English' }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: 'Français' }));

          // then
          assert.strictEqual(currentURL(), '/connexion');
          assert.dom(screen.getByRole('heading', { name: 'Connectez-vous', level: 1 })).exists();
        });
      });
    });
  });
});
