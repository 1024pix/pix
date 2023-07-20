import { module, test } from 'qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Component | authentication | login-or-register-oidc', function (hooks) {
  setupTest(hooks);

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
          'Votre adresse e-mail n’est pas valide.'
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
            'Votre demande d\'authentification a expiré.'
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
            'L\'adresse e-mail et/ou le mot de passe saisis sont incorrects.'
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
            'Ce compte est déjà associé à cet organisme. Veuillez vous connecter avec un autre compte ou contacter le support.'
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
        assert.strictEqual(component.loginErrorMessage, 'Une erreur est survenue. Veuillez recommencer ou contacter le support.');
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
