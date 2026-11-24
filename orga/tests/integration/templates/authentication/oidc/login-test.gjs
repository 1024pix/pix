import { render } from '@1024pix/ember-testing-library';
import Login from 'pix-orga/templates/authentication/oidc/login';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Template | Authentication | OIDC | login', function (hooks) {
  setupIntlRenderingTest(hooks);

  const model = {
    identity_provider_slug: 'oidc-test-slug',
  };

  module('When user is invited', function () {
    test('it displays the login template with an invitation banner, a login form component and a link to signup form', async function (assert) {
      // given
      const controller = {
        currentInvitation: {
          invitationId: 1,
          code: 'ABC123',
          organizationName: 'Test Organization',
        },
      };

      // when
      const screen = await render(<template><Login @controller={{controller}} @model={{model}} /></template>);

      // then
      assert
        .dom(
          screen.getByText(
            t('pages.login.join-invitation', {
              organizationName: controller.currentInvitation.organizationName,
            }),
          ),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('heading', {
            name: `${t('pages.oidc.login.title')}`,
          }),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('heading', {
            name: `${t('pages.oidc.login.sub-title')}`,
          }),
        )
        .exists();
      assert.dom(screen.getByRole('textbox', { name: t('pages.login-form.email.label') })).exists();
      assert.dom(screen.getByLabelText(t('pages.login-form.password'))).exists();
      assert.dom(screen.getByRole('button', { name: t('pages.login-form.associate-account') })).exists();
      assert.dom(screen.getByRole('link', { name: t('pages.oidc.login.signup-button') })).exists();
    });
  });

  module('When user is not invited', function () {
    test('it displays the login template with a login form component, no invitation banner, and a link to authentication/login instead of the signup form link', async function (assert) {
      // when
      const screen = await render(<template><Login />@model={{model}}</template>);

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            name: `${t('pages.oidc.login.title')}`,
          }),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('heading', {
            name: `${t('pages.oidc.login.sub-title')}`,
          }),
        )
        .exists();
      assert.dom('.invitation-banner').doesNotExist();
      assert.dom(screen.queryByRole('link', { name: t('pages.oidc.login.signup-button') })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: t('common.actions.back') })).exists();
    });
  });
});
