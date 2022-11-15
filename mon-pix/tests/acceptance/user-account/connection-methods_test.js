import { module, test } from 'qunit';
import {
  authenticateByEmail,
  authenticateByGAR,
  authenticateByUsername,
  generateGarAuthenticationURLHash,
} from '../../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { triggerEvent } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { contains } from '../../helpers/contains';
import { clickByLabel } from '../../helpers/click-by-label';
import { fillInByLabel } from '../../helpers/fill-in-by-label';
import setupIntl from '../../helpers/setup-intl';
import PixWindow from 'mon-pix/utils/pix-window';
import sinon from 'sinon';

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
      assert.ok(contains(user.email));
      assert.ok(contains(user.username));
    });

    test("should display user's GAR authentication method", async function (assert) {
      // given
      const garUser = server.create('user', 'external');
      server.create('authentication-method', 'withGarIdentityProvider', { user: garUser });
      sinon.stub(PixWindow, 'getLocationHash').returns(generateGarAuthenticationURLHash(garUser));
      await authenticateByGAR(garUser);

      // when
      await visit('/mon-compte/methodes-de-connexion');

      // then
      assert.ok(contains(this.intl.t('pages.user-account.connexion-methods.authentication-methods.label')));
      assert.ok(contains(this.intl.t('pages.user-account.connexion-methods.authentication-methods.gar')));
    });

    test("should display user's OIDC authentication methods", async function (assert) {
      // given
      const userDetails = {
        email: 'john.doe@example.net',
      };
      const user = server.create('user', 'withEmail', userDetails);
      server.create('authentication-method', 'withGenericOidcIdentityProvider', { user });

      // when
      await authenticateByEmail(user);
      await visit('/mon-compte/methodes-de-connexion');

      // then
      assert.ok(contains(this.intl.t('pages.user-account.connexion-methods.authentication-methods.label')));
      assert.ok(contains('Partenaire OIDC'));
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
      assert.notOk(contains(this.intl.t('pages.user-account.connexion-methods.email')));
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
      assert.notOk(contains(this.intl.t('pages.user-account.connexion-methods.username')));
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
      assert.ok(contains(this.intl.t('pages.user-account.connexion-methods.email')));
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
      assert.ok(contains(this.intl.t('pages.user-account.connexion-methods.email')));
      assert.ok(contains(this.intl.t('pages.user-account.email-verification.update-successful')));
      assert.ok(contains(newEmail));
    });
  });
});
