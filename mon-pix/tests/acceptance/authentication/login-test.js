import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Login', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when feature toggle is false', function (hooks) {
    hooks.beforeEach(function () {
      server.create('feature-toggle', {
        id: 0,
        isNewAuthenticationDesignEnabled: false,
      });
    });

    module('when current url does not contain french tld (.fr)', function () {
      module('when accessing the signin page with "Français" as default language', function () {
        test('displays the signin page with "Français" as selected language', async function (assert) {
          // when

          const screen = await visit('/connexion');

          // then
          assert.strictEqual(currentURL(), '/connexion');
          assert.dom(screen.getByRole('heading', { name: t('pages.sign-in.first-title'), level: 1 })).exists();
          assert.dom(screen.getByRole('button', { name: 'Sélectionnez une langue' })).exists();
        });

        module('when the user select "English" as his language', function () {
          test('displays the login page with "English" as selected language', async function (assert) {
            // when
            const screen = await visit('/connexion');
            await click(screen.getByRole('button', { name: 'Sélectionnez une langue' }));
            await screen.findByRole('listbox');
            await click(screen.getByRole('option', { name: 'English' }));

            // then
            assert.strictEqual(currentURL(), '/connexion');
            assert.dom(screen.getByRole('heading', { name: t('pages.sign-in.first-title'), level: 1 })).exists();
            assert.dom(screen.getByRole('button', { name: 'Select a language' })).exists();
          });
        });
      });

      module('when accessing the login page with "English" as selected language', function () {
        test('displays the login page with "English"', async function (assert) {
          // when
          const screen = await visit('/connexion?lang=en');

          // then
          assert.strictEqual(currentURL(), '/connexion?lang=en');
          assert.dom(screen.getByRole('heading', { name: t('pages.sign-in.first-title'), level: 1 })).exists();
          assert.dom(screen.getByRole('button', { name: 'Select a language' })).exists();
        });

        module('when the user select "Français" as his language', function () {
          test('displays the login page with "Français" as selected language', async function (assert) {
            // given & when
            const screen = await visit('/connexion?lang=en');
            await click(screen.getByRole('button', { name: 'Select a language' }));
            await screen.findByRole('listbox');
            await click(screen.getByRole('option', { name: 'Français' }));

            // then
            assert.strictEqual(currentURL(), '/connexion');
            assert.dom(screen.getByRole('heading', { name: t('pages.sign-in.first-title'), level: 1 })).exists();
            assert.dom(screen.getByRole('button', { name: 'Sélectionnez une langue' })).exists();
          });
        });
      });
    });
  });

  module('when feature toggle is true', function (hooks) {
    hooks.beforeEach(function () {
      server.create('feature-toggle', {
        id: 0,
        isNewAuthenticationDesignEnabled: true,
      });
    });

    test('displays the new layout with a footer', async function (assert) {
      // when
      const screen = await visit('/connexion');
      // then
      assert.dom(screen.getByRole('contentinfo')).exists();
    });
    module('when current url does not contain french tld (.fr)', function () {
      module('when accessing the login page with "English" as selected language', function () {
        module('when the user select "Français" as his language', function () {
          test('displays the login page with "Français" as selected language', async function (assert) {
            // given & when
            const screen = await visit('/connexion?lang=en');
            await click(screen.getByRole('button', { name: 'Select a language' }));
            await screen.findByRole('listbox');
            await click(screen.getByRole('option', { name: 'Français' }));

            // then
            assert.strictEqual(currentURL(), '/connexion');
            assert.dom(screen.getByRole('heading', { name: t('pages.sign-in.title'), level: 1 })).exists();
            assert.dom(screen.getByRole('button', { name: 'Sélectionnez une langue' })).exists();
          });
        });
      });
    });
  });
});
