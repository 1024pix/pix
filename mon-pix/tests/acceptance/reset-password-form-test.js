import { visit } from '@1024pix/ember-testing-library';
import { currentURL, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';
import { clickByLabel } from '../helpers/click-by-label';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Reset Password Form', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when "New authentication design" feature toggle is disabled', function (hooks) {
    hooks.beforeEach(function () {
      server.create('feature-toggle', {
        id: 0,
        isNewAuthenticationDesignEnabled: false,
      });
    });

    test('can visit /changer-mot-de-passe when temporaryKey exists', async function (assert) {
      // given
      server.create('user', {
        id: 1000,
        firstName: 'Brandone',
        lastName: 'Martins',
        email: 'brandone.martins@pix.com',
        password: '1024pix!',
      });

      server.create('password-reset-demand', {
        temporaryKey: 'temporaryKey',
        email: 'brandone.martins@pix.com',
      });

      // when
      await visit('/changer-mot-de-passe/temporaryKey');

      // then
      assert.strictEqual(currentURL(), '/changer-mot-de-passe/temporaryKey');
    });

    test('stays on /changer-mot-de-passe when password is successfully reset', async function (assert) {
      // given
      server.create('user', {
        id: 1000,
        firstName: 'Brandone',
        lastName: 'Martins',
        email: 'brandone.martins@pix.com',
        password: '1024pix!',
      });

      server.create('password-reset-demand', {
        temporaryKey: 'brandone-reset-key',
        email: 'brandone.martins@pix.com',
      });

      const screen = await visit('/changer-mot-de-passe/brandone-reset-key');
      const passwordInput = screen.getByLabelText('Mot de passe');
      await fillIn(passwordInput, 'newPass12345!');

      // when
      await clickByLabel(t('pages.reset-password.actions.submit'));

      // then
      assert.strictEqual(currentURL(), '/changer-mot-de-passe/brandone-reset-key');
    });

    test('allows connected user to visit reset-password page', async function (assert) {
      // given
      const user = server.create('user', {
        id: 1000,
        firstName: 'Brandone',
        lastName: 'Martins',
        email: 'brandone.martins@pix.com',
        password: '1024pix!',
      });

      server.create('password-reset-demand', {
        temporaryKey: 'brandone-reset-key',
        email: 'brandone.martins@pix.com',
      });

      await authenticate(user);

      // when
      await visit('/changer-mot-de-passe/brandone-reset-key');

      // then
      assert.strictEqual(currentURL(), '/changer-mot-de-passe/brandone-reset-key');
    });
  });
});
