import { visit } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { authenticate } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | User account page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('When user is not connected', function () {
    test('should be redirected to connection page', async function (assert) {
      // given / when
      await visit('/mon-compte');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('When user is connected', function (hooks) {
    let user;

    hooks.beforeEach(async function () {
      // given
      user = server.create('user', 'withEmail');
      await authenticate(user);
    });

    test('should display my account page', async function (assert) {
      // when
      await visit('/mon-compte');

      // then
      assert.strictEqual(currentURL(), '/mon-compte/informations-personnelles');
    });

    module('My account menu', function () {
      test('should display my account menu', async function (assert) {
        // when
        const screen = await visit('/mon-compte');

        // then
        assert.ok(
          screen.getByRole('link', { name: this.intl.t('pages.user-account.personal-information.menu-link-title') }),
        );
        assert.ok(
          screen.getByRole('link', { name: this.intl.t('pages.user-account.connexion-methods.menu-link-title') }),
        );
        assert.ok(screen.getByRole('link', { name: this.intl.t('pages.user-account.language.menu-link-title') }));
      });

      test('should display personal information on click on "Informations personnelles"', async function (assert) {
        // given
        const screen = await visit('/mon-compte');

        // when
        await click(
          screen.getByRole('link', { name: this.intl.t('pages.user-account.personal-information.menu-link-title') }),
        );

        // then
        assert.strictEqual(currentURL(), '/mon-compte/informations-personnelles');
      });

      test('should display connection methods on click on "Méthodes de connexion"', async function (assert) {
        // given
        const screen = await visit('/mon-compte');

        // when
        await click(
          screen.getByRole('link', { name: this.intl.t('pages.user-account.connexion-methods.menu-link-title') }),
        );

        // then
        assert.strictEqual(currentURL(), '/mon-compte/methodes-de-connexion');
      });

      module('When not in France domain', () => {
        test('displays language switcher on click on "Choisir ma langue"', async function (assert) {
          // given
          class CurrentDomainStubService extends Service {
            get isFranceDomain() {
              return false;
            }

            getExtension = sinon.stub().returns('org');
          }

          this.owner.register('service:currentDomain', CurrentDomainStubService);

          const screen = await visit('/mon-compte');

          // when
          await click(screen.getByRole('link', { name: this.intl.t('pages.user-account.language.menu-link-title') }));

          // then
          const languageSwitcherGeneric = screen.getByRole('button', { name: 'Sélectionnez une langue' });

          assert.strictEqual(currentURL(), '/mon-compte/langue');
          assert.dom(languageSwitcherGeneric).exists();
        });
      });

      module('When in France domain', () => {
        test('does not display language menu link', async function (assert) {
          // given
          class CurrentDomainStubService extends Service {
            get isFranceDomain() {
              return true;
            }

            getExtension = sinon.stub().returns('fr');
          }

          this.owner.register('service:currentDomain', CurrentDomainStubService);

          const screen = await visit('/mon-compte');

          // when / then
          const languageMenuLink = screen.queryByRole('link', {
            name: this.intl.t('pages.user-account.language.menu-link-title'),
          });

          assert.dom(languageMenuLink).doesNotExist();
        });
      });
    });
  });
});
