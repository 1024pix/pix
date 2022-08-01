import { module, test } from 'qunit';
import {
  authenticateByEmail,
  authenticateByGAR,
  authenticateByUsername,
  authenticateByCnav,
} from '../../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { triggerEvent } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { contains } from '../../helpers/contains';
import { clickByLabel } from '../../helpers/click-by-label';
import { fillInByLabel } from '../../helpers/fill-in-by-label';
import setupIntl from '../../helpers/setup-intl';

module('Acceptance | user-account | connection-methods', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('connection method details', function () {
    test("should display user's email and username", async function (assert) {
      // given
      const userDetails = {
        email: 'john.doe@example.net',
        username: 'john.doe0101',
      };
      const user = server.create('user', 'withEmail', userDetails);
      server.create('authentication-method', 'withPixIdentityProvider', { user });
      await authenticateByEmail(user);

      // when
      await visit('/mon-compte/methodes-de-connexion');

      // then
      assert.dom(contains(user.email)).exists();
      assert.dom(contains(user.username)).exists();
    });

    test("should display user's GAR authentication method", async function (assert) {
      // given
      const garUser = server.create('user', 'external');
      server.create('authentication-method', 'withGarIdentityProvider', { user: garUser });
      await authenticateByGAR(garUser);

      // when
      await visit('/mon-compte/methodes-de-connexion');

      // then
      assert.dom(contains(this.intl.t('pages.user-account.connexion-methods.authentication-methods.label'))).exists();
      assert.dom(contains(this.intl.t('pages.user-account.connexion-methods.authentication-methods.gar'))).exists();
    });

    test("should display user's Pole Emploi authentication method", async function (assert) {
      // given
      const userDetails = {
        email: 'john.doe@example.net',
      };
      const user = server.create('user', 'withEmail', userDetails);
      server.create('authentication-method', 'withPoleEmploiIdentityProvider', { user });
      await authenticateByEmail(user);

      // when
      await visit('/mon-compte/methodes-de-connexion');

      // then
      assert.dom(contains(this.intl.t('pages.user-account.connexion-methods.authentication-methods.label'))).exists();
      assert
        .dom(contains(this.intl.t('pages.user-account.connexion-methods.authentication-methods.pole-emploi')))
        .exists();
    });

    test("should display user's Cnav authentication method", async function (assert) {
      // given
      const garUser = server.create('user', 'external');
      server.create('authentication-method', 'withCnavIdentityProvider', { user: garUser });
      await authenticateByCnav(garUser);

      // when
      const screen = await visit('/mon-compte/methodes-de-connexion');

      // then
      assert
        .dom(screen.getByText(this.intl.t('pages.user-account.connexion-methods.authentication-methods.label')))
        .exists();
      assert
        .dom(screen.getByText(this.intl.t('pages.user-account.connexion-methods.authentication-methods.cnav')))
        .exists();
    });
  });

  module('when user does not have an email', function () {
    test('should not display email', async function (assert) {
      // given
      const userDetails = {
        username: 'john.doe0101',
      };
      const user = server.create('user', 'withUsername', userDetails);
      await authenticateByUsername(user);

      // when
      await visit('/mon-compte/methodes-de-connexion');

      // then
      assert.dom(contains(this.intl.t('pages.user-account.connexion-methods.email'))).doesNotExist();
    });
  });

  module('when user does not have a username', function () {
    test('should not display username', async function (assert) {
      // given
      const userDetails = {
        email: 'john.doe@example.net',
      };
      const user = server.create('user', 'withEmail', userDetails);
      await authenticateByEmail(user);

      // when
      await visit('/mon-compte/methodes-de-connexion');

      // then
      assert.dom(contains(this.intl.t('pages.user-account.connexion-methods.username'))).doesNotExist();
    });
  });

  module('email editing', function () {
    test('should reset email editing process when changing page', async function (assert) {
      // given
      const user = server.create('user', 'withEmail');
      server.create('authentication-method', 'withPixIdentityProvider', { user });
      await authenticateByEmail(user);
      await visit('/mon-compte/methodes-de-connexion');
      await clickByLabel(this.intl.t('pages.user-account.connexion-methods.edit-button'));

      // when
      await visit('/mon-compte/informations-personnelles');
      await visit('/mon-compte/methodes-de-connexion');

      // then
      assert.dom(contains(this.intl.t('pages.user-account.connexion-methods.email'))).exists();
    });

    test('should be able to edit the email, enter the code received, and be successfully redirected to account page', async function (assert) {
      // given
      const user = server.create('user', 'withEmail');
      server.create('authentication-method', 'withPixIdentityProvider', { user });
      await authenticateByEmail(user);
      const newEmail = 'new-email@example.net';
      await visit('/mon-compte/methodes-de-connexion');

      // when
      await clickByLabel(this.intl.t('pages.user-account.connexion-methods.edit-button'));
      await fillInByLabel(
        this.intl.t('pages.user-account.account-update-email-with-validation.fields.new-email.label'),
        newEmail
      );
      await fillInByLabel(
        this.intl.t('pages.user-account.account-update-email-with-validation.fields.password.label'),
        user.password
      );
      await clickByLabel(this.intl.t('pages.user-account.account-update-email-with-validation.save-button'));
      await triggerEvent('#code-input-1', 'paste', { clipboardData: { getData: () => '123456' } });

      // then
      assert.dom(contains(this.intl.t('pages.user-account.connexion-methods.email'))).exists();
      assert.dom(contains(this.intl.t('pages.user-account.email-verification.update-successful'))).exists();
      assert.dom(contains(newEmail)).exists();
    });
  });
});
