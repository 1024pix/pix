import { currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticateByEmail } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { contains } from '../helpers/contains';
import { clickByLabel } from '../helpers/click-by-label';
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
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When user is connected', function () {
    let user;

    hooks.beforeEach(async function () {
      // given
      user = server.create('user', 'withEmail');
      await authenticateByEmail(user);
    });

    test('should display my account page', async function (assert) {
      // when
      await visit('/mon-compte');

      // then
      assert.equal(currentURL(), '/mon-compte/informations-personnelles');
    });

    module('My account menu', function () {
      test('should display my account menu', async function (assert) {
        // when
        await visit('/mon-compte');

        // then
        assert.dom(contains(this.intl.t('pages.user-account.personal-information.menu-link-title'))).exists();
        assert.dom(contains(this.intl.t('pages.user-account.connexion-methods.menu-link-title'))).exists();
        assert.dom(contains(this.intl.t('pages.user-account.language.menu-link-title'))).exists();
      });

      test('should display personal information on click on "Informations personnelles"', async function (assert) {
        // given
        await visit('/mon-compte');

        // when
        await clickByLabel(this.intl.t('pages.user-account.personal-information.menu-link-title'));

        // then
        assert.equal(currentURL(), '/mon-compte/informations-personnelles');
      });

      test('should display connection methods on click on "Méthodes de connexion"', async function (assert) {
        // given
        await visit('/mon-compte');

        // when
        await clickByLabel(this.intl.t('pages.user-account.connexion-methods.menu-link-title'));

        // then
        assert.equal(currentURL(), '/mon-compte/methodes-de-connexion');
      });

      test('should display language on click on "Choisir ma langue"', async function (assert) {
        // given
        await visit('/mon-compte');

        // when
        await clickByLabel(this.intl.t('pages.user-account.language.menu-link-title'));

        // then
        assert.equal(currentURL(), '/mon-compte/langue');
      });
    });
  });
});
