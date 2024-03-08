import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';
import { reject } from 'rsvp';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
const ApiErrorMessages = ENV.APP.API_ERROR_MESSAGES;

module('Integration | Component | login-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays login information', async function (assert) {
    // when
    const screen = await render(hbs`<LoginForm />`);

    // then
    assert.dom(screen.getByText('Pix Admin')).exists();
    assert.dom(screen.getByText("L'accès à Pix Admin est limité aux administrateurs de la plateforme")).exists();
  });

  module('when google identity provider is disabled', function () {
    test('it displays an email/password login form', async function (assert) {
      // given
      class IdentityProviderServiceStub extends Service {
        isProviderEnabled = sinon.stub();
      }
      this.owner.register('service:oidcIdentityProviders', IdentityProviderServiceStub);
      const identityProvidersServiceStub = this.owner.lookup('service:oidcIdentityProviders');
      identityProvidersServiceStub.isProviderEnabled.withArgs('google').returns(false);

      // when
      const screen = await render(hbs`<LoginForm />`);

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Adresse e-mail' })).exists();
      assert.dom(screen.getByLabelText('Mot de passe')).exists();
      assert.dom(screen.getByRole('button', { name: 'Je me connecte' })).exists();
      assert.dom(screen.queryByRole('link', { name: 'Se connecter avec Google' })).doesNotExist();
    });
  });

  module('when google identity provider is enabled', function () {
    test('it displays a "login with google" button', async function (assert) {
      // given
      class IdentityProviderServiceStub extends Service {
        isProviderEnabled = sinon.stub();
      }
      this.owner.register('service:oidcIdentityProviders', IdentityProviderServiceStub);
      const identityProvidersServiceStub = this.owner.lookup('service:oidcIdentityProviders');
      identityProvidersServiceStub.isProviderEnabled.withArgs('google').returns(true);

      // when
      const screen = await render(hbs`<LoginForm />`);

      // then
      assert.dom(screen.getByRole('link', { name: 'Se connecter avec Google' })).exists();
      assert.dom(screen.queryByRole('button', { name: 'Je me connecte' })).doesNotExist();
    });
  });

  module('Error management', function (hooks) {
    class SessionStub extends Service {
      authenticate = sinon.stub();
    }

    let sessionStub;

    hooks.beforeEach(function () {
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

      const screen = await render(hbs`<LoginForm />`);

      // when
      await fillByLabel('Adresse e-mail', 'pix@example.net');
      await fillByLabel('Mot de passe', 'JeMeLoggue1024');
      await clickByName('Je me connecte');

      // then
      assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.LOGIN_UNAUTHORIZED.I18N_KEY))).exists();
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

      const screen = await render(hbs`<LoginForm />`);

      // when
      await fillByLabel('Adresse e-mail', 'pix@');
      await fillByLabel('Mot de passe', 'JeMeLoggue1024');
      await clickByName('Je me connecte');

      // then
      assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.BAD_REQUEST.I18N_KEY))).exists();
    });

    test('should display good error message when an error 403 occurred', async function (assert) {
      // given
      const errorResponse = {
        status: Number(ApiErrorMessages.LOGIN_NO_PERMISSION.CODE),
        responseJSON: { errors: [{ status: ApiErrorMessages.LOGIN_NO_PERMISSION.CODE }] },
      };
      sessionStub.authenticate = () => reject(errorResponse);

      const screen = await render(hbs`<LoginForm />`);

      // when
      await fillByLabel('Adresse e-mail', 'pix@example.net');
      await fillByLabel('Mot de passe', 'JeMeLoggue1024');
      await clickByName('Je me connecte');

      // then
      assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.LOGIN_NO_PERMISSION.I18N_KEY))).exists();
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

      const screen = await render(hbs`<LoginForm />`);

      // when
      await fillByLabel('Adresse e-mail', 'pix@example.net');
      await fillByLabel('Mot de passe', 'JeMeLoggue1024');
      await clickByName('Je me connecte');

      // then
      assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY))).exists();
    });

    test('should display good error message when an non handled status code', async function (assert) {
      // given
      const errorResponse = {
        status: 418,
        responseJSON: { errors: [{ status: 418 }] },
      };
      sessionStub.authenticate = () => reject(errorResponse);

      const screen = await render(hbs`<LoginForm />`);

      // when
      await fillByLabel('Adresse e-mail', 'pix@example.net');
      await fillByLabel('Mot de passe', 'JeMeLoggue1024');
      await clickByName('Je me connecte');

      // then
      assert.dom(screen.getByText(this.intl.t(ApiErrorMessages.INTERNAL_SERVER_ERROR.I18N_KEY))).exists();
    });
  });
});
