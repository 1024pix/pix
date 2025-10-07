import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import { stubSessionService } from '../../../helpers/service-stubs.js';
import setupIntl from '../../../helpers/setup-intl';

module('Unit | Component | authentication | oidc-signup-or-login', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#register', function () {
    module('completes successfully', function () {
      test('creates session', async function (assert) {
        // given
        const component = createGlimmerComponent('authentication/oidc-signup-or-login');
        const sessionService = stubSessionService(this.owner, { isAuthenticated: false });

        component.args.identityProviderSlug = 'super-idp';
        component.args.authenticationKey = 'super-key';
        component.isTermsOfServiceValidated = true;

        // when
        await component.register();

        // then
        sinon.assert.calledWith(sessionService.authenticate, 'authenticator:oidc', {
          authenticationKey: 'super-key',
          identityProviderSlug: 'super-idp',
          hostSlug: 'users',
        });
        assert.false(component.isRegisterLoading);
      });
    });

    module('when there are errors', function () {
      module('when authentication key has expired', function () {
        test('displays error', async function (assert) {
          // given
          const component = createGlimmerComponent('authentication/oidc-signup-or-login');

          const sessionService = stubSessionService(this.owner, { isAuthenticated: false });
          sessionService.authenticate.rejects({ errors: [{ status: '401', code: 'EXPIRED_AUTHENTICATION_KEY' }] });

          component.args.identityProviderSlug = 'super-idp';
          component.args.authenticationKey = 'super-key';
          component.isTermsOfServiceValidated = true;

          // when
          await component.register();

          // then
          assert.strictEqual(
            component.registerErrorMessage,
            t('pages.oidc-signup-or-login.error.expired-authentication-key'),
          );
        });
      });

      module('when terms of service are not selected', function () {
        test('displays error', function (assert) {
          // given
          const component = createGlimmerComponent('authentication/oidc-signup-or-login');
          component.isTermsOfServiceValidated = false;

          // when
          component.register();

          // then
          assert.strictEqual(component.registerErrorMessage, t('pages.oidc-signup-or-login.error.error-message'));
        });
      });

      test('displays an error message but not with the details', async function (assert) {
        // given
        const component = createGlimmerComponent('authentication/oidc-signup-or-login');
        const sessionService = stubSessionService(this.owner, { isAuthenticated: false });
        sessionService.authenticate.rejects({ errors: [{ status: '500', detail: 'some detail' }] });

        component.args.identityProviderSlug = 'super-idp';
        component.args.authenticationKey = 'super-key';
        component.isTermsOfServiceValidated = true;

        // when
        await component.register();

        // then
        assert.deepEqual(
          component.registerErrorMessage,
          t('common.api-error-messages.login-unexpected-error', {
            supportHomeUrl: 'https://pix.org/fr/support',
            htmlSafe: true,
          }),
        );
      });

      test('displays a default error message', async function (assert) {
        // given
        const component = createGlimmerComponent('authentication/oidc-signup-or-login');
        const sessionService = stubSessionService(this.owner, { isAuthenticated: false });
        sessionService.authenticate.rejects({ errors: [{ status: '500' }] });

        component.args.identityProviderSlug = 'super-idp';
        component.args.authenticationKey = 'super-key';
        component.isTermsOfServiceValidated = true;

        // when
        await component.register();

        // then
        assert.false(component.isRegisterLoading);
        assert.deepEqual(
          component.registerErrorMessage,
          t('common.api-error-messages.login-unexpected-error', {
            supportHomeUrl: 'https://pix.org/fr/support',
            htmlSafe: true,
          }),
        );
      });
    });

    module('while waiting for submission completion', function () {
      test('isRegisterLoading is true', async function (assert) {
        // given
        let inflightLoading;
        const component = createGlimmerComponent('authentication/oidc-signup-or-login');
        const sessionService = stubSessionService(this.owner, { isAuthenticated: false });
        sessionService.authenticate = function () {
          inflightLoading = component.isRegisterLoading;
          return Promise.resolve();
        };

        component.args.identityProviderSlug = 'super-idp';
        component.args.authenticationKey = 'super-key';
        component.isTermsOfServiceValidated = true;

        // when
        await component.register();

        // then
        assert.true(inflightLoading);
      });
    });
  });

  module('#validateEmail', function () {
    test('trims on email validation', function (assert) {
      // given
      const emailWithSpaces = '   glace@aleau.net   ';
      const component = createGlimmerComponent('authentication/oidc-signup-or-login');

      // when
      component.validateEmail({ target: { value: emailWithSpaces } });

      // then
      assert.strictEqual(component.email, emailWithSpaces.trim());
    });

    module('when email is invalid', function () {
      test('displays error', function (assert) {
        // given
        const invalidEmail = 'glace@aleau';
        const component = createGlimmerComponent('authentication/oidc-signup-or-login');

        // when
        component.validateEmail({ target: { value: invalidEmail } });

        // then
        assert.strictEqual(component.emailValidationMessage, t('pages.oidc-signup-or-login.error.invalid-email'));
      });
    });
  });

  module('#login', function (hooks) {
    hooks.beforeEach(function () {
      const oidcPartner = {
        id: 'oidc-partner',
        code: 'OIDC_PARTNER',
        organizationName: 'Partenaire OIDC',
        shouldCloseSession: false,
        source: 'oidc-externe',
      };

      class OidcIdentityProvidersStub extends Service {
        'oidc-partner' = oidcPartner;
        list = [oidcPartner];
      }

      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
    });

    module('completes successfully', function () {
      test('retrieves the existing pix account through the OIDC authenticated user', async function (assert) {
        // given
        const email = 'glace.alo@example.net';
        const password = 'pix123';
        const component = createGlimmerComponent('authentication/oidc-signup-or-login');
        component.email = email;
        component.password = password;
        component.args.onLogin = sinon.stub();
        const eventStub = { preventDefault: sinon.stub() };

        // when
        await component.login(eventStub);

        // then
        sinon.assert.calledWith(component.args.onLogin, {
          enteredPassword: password,
          enteredEmail: email,
        });
        assert.false(component.isLoginLoading);
      });
    });

    module('when there are errors', function () {
      module('when form is invalid', function () {
        test('does not request api for reconciliation', async function (assert) {
          // given
          const component = createGlimmerComponent('authentication/oidc-signup-or-login');
          component.email = '';
          const eventStub = { preventDefault: sinon.stub() };
          component.args.onLogin = sinon.stub();

          // when
          await component.login(eventStub);

          // then
          sinon.assert.notCalled(component.args.onLogin);
          assert.ok(true);
        });
      });

      module('when authentication key has expired', function () {
        test('should display error', async function (assert) {
          // given
          const component = createGlimmerComponent('authentication/oidc-signup-or-login');
          component.args.onLogin = sinon
            .stub()
            .rejects({ errors: [{ status: '401', code: 'EXPIRED_AUTHENTICATION_KEY' }] });
          component.email = 'glace.alo@example.net';
          component.password = 'pix123';
          const eventStub = { preventDefault: sinon.stub() };

          // when
          await component.login(eventStub);

          // then
          assert.strictEqual(
            component.loginErrorMessage,
            t('pages.oidc-signup-or-login.error.expired-authentication-key'),
          );
        });
      });

      module('when there is an account conflict', function () {
        test('should display error', async function (assert) {
          // given
          const component = createGlimmerComponent('authentication/oidc-signup-or-login');
          component.args.onLogin = sinon.stub().rejects({ errors: [{ status: '409' }] });
          component.email = 'glace.alo@example.net';
          component.password = 'pix123';
          const eventStub = { preventDefault: sinon.stub() };

          // when
          await component.login(eventStub);

          // then
          assert.strictEqual(component.loginErrorMessage, t('pages.oidc-signup-or-login.error.account-conflict'));
        });
      });

      module('when user account is temporarily blocked', function () {
        test('displays error', async function (assert) {
          // given
          const component = createGlimmerComponent('authentication/oidc-signup-or-login');

          const sessionService = stubSessionService(this.owner, { isAuthenticated: false });
          sessionService.authenticate.rejects({
            errors: [{ status: '403', code: 'USER_IS_TEMPORARY_BLOCKED', meta: { blockingDurationMs: 60000 } }],
          });

          component.args.identityProviderSlug = 'super-idp';
          component.args.authenticationKey = 'super-key';
          component.isTermsOfServiceValidated = true;

          // when
          await component.register();

          // then
          assert.deepEqual(
            component.registerErrorMessage,
            t('common.api-error-messages.login-user-temporary-blocked-error', {
              url: '/mot-de-passe-oublie',
              blockingDurationMinutes: 1,
              htmlSafe: true,
            }),
          );
        });
      });

      module('when user account is blocked', function () {
        test('displays error', async function (assert) {
          // given
          const component = createGlimmerComponent('authentication/oidc-signup-or-login');

          const sessionService = stubSessionService(this.owner, { isAuthenticated: false });
          sessionService.authenticate.rejects({ errors: [{ status: '403', code: 'USER_IS_BLOCKED' }] });

          component.args.identityProviderSlug = 'super-idp';
          component.args.authenticationKey = 'super-key';
          component.isTermsOfServiceValidated = true;

          // when
          await component.register();

          // then
          assert.deepEqual(
            component.registerErrorMessage,
            t('common.api-error-messages.login-user-blocked-error', {
              url: 'https://support.pix.org/support/tickets/new',
              htmlSafe: true,
            }),
          );
        });
      });

      test('displays default error message', async function (assert) {
        // given
        const component = createGlimmerComponent('authentication/oidc-signup-or-login');
        component.args.onLogin = sinon.stub().rejects({ errors: [{ status: '500' }] });
        component.email = 'glace.alo@example.net';
        component.password = 'pix123';
        const eventStub = { preventDefault: sinon.stub() };

        // when
        await component.login(eventStub);

        // then
        assert.false(component.isLoginLoading);
        assert.deepEqual(
          component.loginErrorMessage,
          t('common.api-error-messages.login-unexpected-error', {
            supportHomeUrl: 'https://pix.org/fr/support',
            htmlSafe: true,
          }),
        );
      });
    });

    module('while waiting for submission completion', function () {
      test('isLoginLoading is true', async function (assert) {
        // given
        let inflightLoading;
        const eventStub = { preventDefault: sinon.stub() };
        const component = createGlimmerComponent('authentication/oidc-signup-or-login');
        component.args.onLogin = function () {
          inflightLoading = component.isLoginLoading;
          return Promise.resolve();
        };
        component.email = 'glace.alo@example.net';
        component.password = 'pix123';

        // when
        await component.login(eventStub);

        // then
        assert.true(inflightLoading);
      });
    });
  });
});
