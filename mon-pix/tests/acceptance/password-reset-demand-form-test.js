import { visit } from '@1024pix/ember-testing-library';
import { currentURL, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { clickByLabel } from '../helpers/click-by-label';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Password reset demand form', function (hooks) {
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

    test('can visit /mot-passe-oublie', async function (assert) {
      // when
      await visit('/mot-de-passe-oublie');

      // then
      assert.strictEqual(currentURL(), '/mot-de-passe-oublie');
    });

    test('stays on "mot de passe oublié" page, and shows success message when email sent correspond to an existing user', async function (assert) {
      // given
      this.server.create('user', {
        id: 1,
        firstName: 'Brandone',
        lastName: 'Martins',
        email: 'brandone.martins@pix.com',
        password: '1024pix!',
      });
      await visit('/mot-de-passe-oublie');
      await fillIn('#email', 'brandone.martins@pix.com');

      // when
      await clickByLabel(t('pages.password-reset-demand.actions.reset'));

      assert.strictEqual(currentURL(), '/mot-de-passe-oublie');
      assert.dom('.password-reset-demand-form__body').exists();
    });

    test('stays in mot-passe-oublie page when sent email do not correspond to any existing user', async function (assert) {
      // given
      this.server.create('user', {
        id: 1,
        firstName: 'Brandone',
        lastName: 'Martins',
        email: 'brandone.martins@pix.com',
        password: '1024pix!',
      });
      const screen = await visit('/mot-de-passe-oublie');
      await fillIn('#email', 'unexisting@user.com');

      // when
      await clickByLabel(t('pages.password-reset-demand.actions.reset'));

      // then
      assert.strictEqual(currentURL(), '/mot-de-passe-oublie');
      assert.dom(screen.getByText(t('pages.password-reset-demand.error.message'))).exists();
    });
  });

  module('when "New authentication design" feature toggle is enabled', function (hooks) {
    hooks.beforeEach(function () {
      server.create('feature-toggle', {
        id: 0,
        isNewAuthenticationDesignEnabled: true,
      });
    });

    test('can visit /mot-passe-oublie', async function (assert) {
      // when
      await visit('/mot-de-passe-oublie');

      // then
      assert.strictEqual(currentURL(), '/mot-de-passe-oublie');
    });

    test('stays on "mot de passe oublié" page, and shows success message when email sent correspond to an existing user', async function (assert) {
      // given
      this.server.create('user', {
        id: 1,
        firstName: 'Brandone',
        lastName: 'Martins',
        email: 'brandone.martins@pix.com',
        password: '1024pix!',
      });
      const screen = await visit('/mot-de-passe-oublie');
      await fillIn(
        screen.getByRole('textbox', { name: t('pages.password-reset-demand.fields.email.label') }),
        'brandone.martins@pix.com',
      );

      // when
      await clickByLabel(t('components.authentication.password-reset-demand-form.actions.receive-reset-button'));

      assert.strictEqual(currentURL(), '/mot-de-passe-oublie');
    });
  });
});
