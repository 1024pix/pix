import { module, test } from 'qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import { setupTest } from 'ember-qunit';
import setupIntl from '../../../helpers/setup-intl';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Component | authentication | login-or-register-oidc', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#register', function () {
    module('completes successfully', function () {
      test('creates session', async function (assert) {
        // given
        const component = createGlimmerComponent('authentication/login-or-register-oidc');
        const authenticateStub = sinon.stub();

        class SessionStub extends Service {
          authenticate = authenticateStub;
        }

        this.owner.register('service:session', SessionStub);
        component.args.identityProviderSlug = 'super-idp';
        component.args.authenticationKey = 'super-key';
        component.isTermsOfServiceValidated = true;

        // when
        await component.register();

        // then
        sinon.assert.calledWith(authenticateStub, 'authenticator:oidc', {
          authenticationKey: 'super-key',
          identityProviderSlug: 'super-idp',
          hostSlug: 'users',
        });
        assert.false(component.isRegisterLoading);
      });
    });

    module('completes with error', function () {
      module('when authentication key has expired', function () {
        test('displays error', async function (assert) {
          // given
          const component = createGlimmerComponent('authentication/login-or-register-oidc');
          const authenticateStub = sinon.stub().rejects({ errors: [{ status: '401' }] });

          class SessionStub extends Service {
            authenticate = authenticateStub;
          }

          this.owner.register('service:session', SessionStub);
          component.args.identityProviderSlug = 'super-idp';
          component.args.authenticationKey = 'super-key';
          component.isTermsOfServiceValidated = true;

          // when
          await component.register();

          // then
          assert.strictEqual(
            component.registerErrorMessage,
            this.intl.t('pages.login-or-register-oidc.error.expired-authentication-key'),
          );
        });
      });

      module('when terms of service are not selected', function () {
        test('displays error', function (assert) {
          // given
          const component = createGlimmerComponent('authentication/login-or-register-oidc');
          component.isTermsOfServiceValidated = false;

          // when
          component.register();

          // then
          assert.strictEqual(
            component.registerErrorMessage,
            this.intl.t('pages.login-or-register-oidc.error.error-message'),
          );
        });
      });

      module('locale errors', function () {
        module('when invalid locale', function () {
          test('it displays the invalid locale error message', async function (assert) {
            // given
            const component = createGlimmerComponent('authentication/login-or-register-oidc');
            const authenticateStub = sinon
              .stub()
              .rejects({ errors: [{ status: '400', code: 'INVALID_LOCALE_FORMAT', meta: { locale: 'zzzz' } }] });

            class SessionStub extends Service {
              authenticate = authenticateStub;
            }

            this.owner.register('service:session', SessionStub);
            component.args.identityProviderSlug = 'super-idp';
            component.args.authenticationKey = 'super-key';
            component.isTermsOfServiceValidated = true;

            // when
            await component.register();

            // then
            assert.strictEqual(
              component.registerErrorMessage,
              `${this.intl.t('pages.sign-up.errors.invalid-locale-format', { invalidLocale: 'zzzz' })}`,
            );
          });
        });

        module('when locale is not supported', function () {
          test('it displays the unsupported locale error message', async function (assert) {
            // given
            const component = createGlimmerComponent('authentication/login-or-register-oidc');
            const authenticateStub = sinon
              .stub()
              .rejects({ errors: [{ status: '400', code: 'LOCALE_NOT_SUPPORTED', meta: { locale: 'jp' } }] });

            class SessionStub extends Service {
              authenticate = authenticateStub;
            }

            this.owner.register('service:session', SessionStub);
            component.args.identityProviderSlug = 'super-idp';
            component.args.authenticationKey = 'super-key';
            component.isTermsOfServiceValidated = true;

            // when
            await component.register();

            // then
            assert.strictEqual(
              component.registerErrorMessage,
              `${this.intl.t('pages.sign-up.errors.locale-not-supported', { localeNotSupported: 'jp' })}`,
            );
          });
        });
      });

      test('displays error message with details', async function (assert) {
        // given
        const component = createGlimmerComponent('authentication/login-or-register-oidc');
        const authenticateStub = sinon.stub().rejects({ errors: [{ status: '500', detail: 'some detail' }] });

        class SessionStub extends Service {
          authenticate = authenticateStub;
        }

        this.owner.register('service:session', SessionStub);
        component.args.identityProviderSlug = 'super-idp';
        component.args.authenticationKey = 'super-key';
        component.isTermsOfServiceValidated = true;

        // when
        await component.register();

        // then
        assert.strictEqual(component.registerErrorMessage, `${this.intl.t('common.error')} (some detail)`);
      });

      test('displays default error message', async function (assert) {
        // given
        const component = createGlimmerComponent('authentication/login-or-register-oidc');
        const authenticateStub = sinon.stub().rejects({ errors: [{ status: '500' }] });

        class SessionStub extends Service {
          authenticate = authenticateStub;
        }

        this.owner.register('service:session', SessionStub);
        component.args.identityProviderSlug = 'super-idp';
        component.args.authenticationKey = 'super-key';
        component.isTermsOfServiceValidated = true;

        // when
        await component.register();

        // then
        assert.false(component.isRegisterLoading);
        assert.strictEqual(component.registerErrorMessage, this.intl.t('common.error'));
      });
    });

    module('while waiting for submission completion', function () {
      test('isRegisterLoading is true', async function (assert) {
        // given
        let inflightLoading;
        const component = createGlimmerComponent('authentication/login-or-register-oidc');
        const authenticateStub = function () {
          inflightLoading = component.isRegisterLoading;
          return Promise.resolve();
        };
        class SessionStub extends Service {
          authenticate = authenticateStub;
        }

        this.owner.register('service:session', SessionStub);
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
      const component = createGlimmerComponent('authentication/login-or-register-oidc');

      // when
      component.validateEmail({ target: { value: emailWithSpaces } });

      // then
      assert.strictEqual(component.email, emailWithSpaces.trim());
    });

    module('when email is invalid', function () {
      test('displays error', function (assert) {
        // given
        const invalidEmail = 'glace@aleau';
        const component = createGlimmerComponent('authentication/login-or-register-oidc');

        // when
        component.validateEmail({ target: { value: invalidEmail } });

        // then
        assert.strictEqual(
          component.emailValidationMessage,
          this.intl.t('pages.login-or-register-oidc.error.invalid-email'),
        );
      });
    });
  });

  module('#login', function (hooks) {
    hooks.beforeEach(function () {
      const oidcPartner = {
        id: 'oidc-partner',
        code: 'OIDC_PARTNER',
        organizationName: 'Partenaire OIDC',
        hasLogoutUrl: false,
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
        const component = createGlimmerComponent('authentication/login-or-register-oidc');
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

    module('completes with error', function () {
      module('when form is invalid', function () {
        test('does not request api for reconciliation', async function (assert) {
          // given
          const component = createGlimmerComponent('authentication/login-or-register-oidc');
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
          const component = createGlimmerComponent('authentication/login-or-register-oidc');
          component.args.onLogin = sinon.stub().rejects({ errors: [{ status: '401' }] });
          component.email = 'glace.alo@example.net';
          component.password = 'pix123';
          const eventStub = { preventDefault: sinon.stub() };

          // when
          await component.login(eventStub);

          // then
          assert.strictEqual(
            component.loginErrorMessage,
            this.intl.t('pages.login-or-register-oidc.error.expired-authentication-key'),
          );
        });
      });

      module('when user is not found', function () {
        test('should display error', async function (assert) {
          // given
          const component = createGlimmerComponent('authentication/login-or-register-oidc');
          component.args.onLogin = sinon.stub().rejects({ errors: [{ status: '404' }] });
          component.email = 'glace.alo@example.net';
          component.password = 'pix123';
          const eventStub = { preventDefault: sinon.stub() };

          // when
          await component.login(eventStub);

          // then
          assert.strictEqual(
            component.loginErrorMessage,
            this.intl.t('pages.login-or-register-oidc.error.login-unauthorized-error'),
          );
        });
      });

      module('when there is an account conflict', function () {
        test('should display error', async function (assert) {
          // given
          const component = createGlimmerComponent('authentication/login-or-register-oidc');
          component.args.onLogin = sinon.stub().rejects({ errors: [{ status: '409' }] });
          component.email = 'glace.alo@example.net';
          component.password = 'pix123';
          const eventStub = { preventDefault: sinon.stub() };

          // when
          await component.login(eventStub);

          // then
          assert.strictEqual(
            component.loginErrorMessage,
            this.intl.t('pages.login-or-register-oidc.error.account-conflict'),
          );
        });
      });

      test('displays default error message', async function (assert) {
        // given
        const component = createGlimmerComponent('authentication/login-or-register-oidc');
        component.args.onLogin = sinon.stub().rejects({ errors: [{ status: '500' }] });
        component.email = 'glace.alo@example.net';
        component.password = 'pix123';
        const eventStub = { preventDefault: sinon.stub() };

        // when
        await component.login(eventStub);

        // then
        assert.false(component.isLoginLoading);
        assert.strictEqual(component.loginErrorMessage, this.intl.t('common.error'));
      });
    });

    module('while waiting for submission completion', function () {
      test('isLoginLoading is true', async function (assert) {
        // given
        let inflightLoading;
        const eventStub = { preventDefault: sinon.stub() };
        const component = createGlimmerComponent('authentication/login-or-register-oidc');
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
