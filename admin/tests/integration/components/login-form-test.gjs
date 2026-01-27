import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import LoginForm from 'pix-admin/components/login-form';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';
import { reject } from 'rsvp';
import sinon from 'sinon';

import { stubConfigService } from '../../helpers/service-stubs.js';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

module('Integration | Component | login-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays login logo and information', async function (assert) {
    // when
    const screen = await render(<template><LoginForm /></template>);

    // then
    assert.dom(screen.getByRole('img', { name: 'Pix Admin' })).hasAttribute('src', '/admin-logo.svg');
    assert.dom(screen.getByText("L'accès à Pix Admin est limité aux administrateurs de la plateforme")).exists();
  });

  module('Password login form', function () {
    module('when permitPixAdminLoginFromPassword is enabled', function () {
      test('displays a password login form', async function (assert) {
        // given
        stubConfigService(this.owner, { permitPixAdminLoginFromPassword: true });

        // when
        const screen = await render(<template><LoginForm /></template>);

        // then
        assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail' })).exists();
        assert.dom(screen.getByLabelText('Mot de passe')).exists();
        assert.dom(screen.getByRole('button', { name: 'Je me connecte' })).exists();
      });
    });

    module('when permitPixAdminLoginFromPassword is disabled', function () {
      test('does not display a password login form', async function (assert) {
        // given
        stubConfigService(this.owner, { permitPixAdminLoginFromPassword: false });

        // when
        const screen = await render(<template><LoginForm /></template>);

        // then
        assert.dom(screen.queryByRole('textbox', { name: 'Adresse e-mail' })).doesNotExist();
        assert.dom(screen.queryByLabelText('Mot de passe')).doesNotExist();
      });
    });
  });

  module('when there is an identity provider enabled for Pix Admin', function (hooks) {
    hooks.beforeEach(function () {
      const oidcPartner = {
        id: 'oidc-partner',
        slug: 'oidc-partner',
        code: 'OIDC_PARTNER',
        organizationName: 'Partenaire OIDC',
      };
      class OidcIdentityProvidersStub extends Service {
        'oidc-partner' = oidcPartner;
        list = [oidcPartner];
        hasIdentityProviders = true;
        isProviderEnabled = sinon.stub();
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
    });

    test('displays a "login with SSO" button', async function (assert) {
      // when
      const screen = await render(<template><LoginForm /></template>);

      // then
      assert
        .dom(
          screen.getByRole('link', {
            name: t('pages.login.authenticate-with-sso-provider', { ssoProviderName: 'Partenaire OIDC' }),
          }),
        )
        .exists();
    });

    module('when user has no Pix account', function () {
      test('displays a specific error message', async function (assert) {
        // given
        const userShouldCreateAnAccount = true;

        // when
        const screen = await render(
          <template><LoginForm @userShouldCreateAnAccount={{userShouldCreateAnAccount}} /></template>,
        );

        // then
        assert.dom(screen.getByText("Vous n'avez pas de compte Pix.")).exists();
      });
    });

    module('when user has no Pix access rights', function () {
      test('displays a specific error message', async function (assert) {
        // given
        const userShouldRequestAccess = true;

        // when
        const screen = await render(
          <template><LoginForm @userShouldRequestAccess={{userShouldRequestAccess}} /></template>,
        );

        // then
        assert
          .dom(
            screen.getByText(
              "Vous n'avez pas les droits pour vous connecter. Veuillez demander un accès aux administrateurs de la plateforme.",
            ),
          )
          .exists();
      });
    });

    module('when api throw an unknown error', function () {
      test('displays an error message', async function (assert) {
        // given
        const unknownErrorHasOccured = true;

        // when
        const screen = await render(
          <template><LoginForm @unknownErrorHasOccured={{unknownErrorHasOccured}} /></template>,
        );

        // then
        assert
          .dom(
            screen.getByText(
              'Une erreur est survenue. Veuillez recommencer ou contacter les administrateurs de la plateforme.',
            ),
          )
          .exists();
      });
    });
  });

  module('Error management', function (hooks) {
    class SessionStub extends Service {
      authenticate = sinon.stub();
    }

    let sessionStub;

    hooks.beforeEach(function () {
      stubConfigService(this.owner, { permitPixAdminLoginFromPassword: true });

      this.owner.register('service:session', SessionStub);
      sessionStub = this.owner.lookup('service:session');
    });

    test('should display good error message when an error 401 occurred', async function (assert) {
      // given
      const errorResponse = {
        status: Number(ApiErrorMessages.LOGIN_UNAUTHORIZED.CODE),
        responseJSON: {
          errors: [
            {
              status: ApiErrorMessages.LOGIN_UNAUTHORIZED.CODE,
              detail: ApiErrorMessages.LOGIN_UNAUTHORIZED.I18N_KEY,
            },
          ],
        },
      };
      sessionStub.authenticate = () => reject(errorResponse);

      const screen = await render(<template><LoginForm /></template>);

      // when
      await fillByLabel('Adresse e-mail', 'pix@example.net');
      await fillByLabel('Mot de passe', 'JeMeLoggue1024');
      await clickByName('Je me connecte');

      // then
      assert.dom(screen.getByText(t(ApiErrorMessages.LOGIN_UNAUTHORIZED.I18N_KEY))).exists();
    });

    test('should display good error message when login with username and password is disabled', async function (assert) {
      // given
      const errorResponse = {
        status: Number(ApiErrorMessages.PIX_ADMIN_LOGIN_FROM_PASSWORD_DISABLED.CODE),
        responseJSON: {
          errors: [
            {
              status: ApiErrorMessages.PIX_ADMIN_LOGIN_FROM_PASSWORD_DISABLED.CODE,
              code: 'PIX_ADMIN_LOGIN_FROM_PASSWORD_DISABLED',
              detail: ApiErrorMessages.PIX_ADMIN_LOGIN_FROM_PASSWORD_DISABLED.I18N_KEY,
            },
          ],
        },
      };
      sessionStub.authenticate = () => reject(errorResponse);

      const screen = await render(<template><LoginForm /></template>);

      // when
      await fillByLabel('Adresse e-mail', 'pix@example.net');
      await fillByLabel('Mot de passe', 'JeMeLoggue1024');
      await clickByName('Je me connecte');

      // then
      assert.dom(screen.getByText(t(ApiErrorMessages.PIX_ADMIN_LOGIN_FROM_PASSWORD_DISABLED.I18N_KEY))).exists();
    });

    test('should display good error message when an error 400 occurred', async function (assert) {
      // given
      const errorResponse = {
        status: Number(ApiErrorMessages.BAD_REQUEST.CODE),
        responseJSON: {
          errors: [
            {
              status: ApiErrorMessages.BAD_REQUEST.CODE,
              detail: ApiErrorMessages.BAD_REQUEST.I18N_KEY,
            },
          ],
        },
      };
      sessionStub.authenticate = () => reject(errorResponse);

      const screen = await render(<template><LoginForm /></template>);

      // when
      await fillByLabel('Adresse e-mail', 'pix@');
      await fillByLabel('Mot de passe', 'JeMeLoggue1024');
      await clickByName('Je me connecte');

      // then
      assert.dom(screen.getByText(t(ApiErrorMessages.BAD_REQUEST.I18N_KEY))).exists();
    });

    test('should display good error message when an error 403 occurred', async function (assert) {
      // given
      const errorResponse = {
        status: Number(ApiErrorMessages.LOGIN_NO_PERMISSION.CODE),
        responseJSON: { errors: [{ status: ApiErrorMessages.LOGIN_NO_PERMISSION.CODE }] },
      };
      sessionStub.authenticate = () => reject(errorResponse);

      const screen = await render(<template><LoginForm /></template>);

      // when
      await fillByLabel('Adresse e-mail', 'pix@example.net');
      await fillByLabel('Mot de passe', 'JeMeLoggue1024');
      await clickByName('Je me connecte');

      // then
      assert.dom(screen.getByText(t(ApiErrorMessages.LOGIN_NO_PERMISSION.I18N_KEY))).exists();
    });

    test('should display good error message when an 500 error occurred', async function (assert) {
      // given
      const errorResponse = {
        status: Number(ApiErrorMessages.INTERNAL_SERVER_ERROR.CODE),
        responseJSON: {
          errors: [
            {
              status: ApiErrorMessages.INTERNAL_SERVER_ERROR.CODE,
              detail: ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY,
            },
          ],
        },
      };
      sessionStub.authenticate = () => reject(errorResponse);

      const screen = await render(<template><LoginForm /></template>);

      // when
      await fillByLabel('Adresse e-mail', 'pix@example.net');
      await fillByLabel('Mot de passe', 'JeMeLoggue1024');
      await clickByName('Je me connecte');

      // then
      assert.dom(screen.getByText(t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY))).exists();
    });

    test('should display good error message when an non handled status code', async function (assert) {
      // given
      const errorResponse = {
        status: 418,
        responseJSON: { errors: [{ status: 418 }] },
      };
      sessionStub.authenticate = () => reject(errorResponse);

      const screen = await render(<template><LoginForm /></template>);

      // when
      await fillByLabel('Adresse e-mail', 'pix@example.net');
      await fillByLabel('Mot de passe', 'JeMeLoggue1024');
      await clickByName('Je me connecte');

      // then
      assert.dom(screen.getByText(t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY))).exists();
    });
  });
});
