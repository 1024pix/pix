import EmberObject from '@ember/object';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import { stubSessionService } from '../../../helpers/service-stubs.js';
import setupIntl from '../../../helpers/setup-intl';

module('Unit | Component | authentication | oidc-reconciliation', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#backToLoginOrRegisterForm', function () {
    test('should redirect back to login or register page', function (assert) {
      // given
      const component = createGlimmerComponent('authentication/oidc-reconciliation');
      component.args.toggleOidcReconciliation = sinon.stub();

      // when
      component.backToLoginOrRegisterForm();

      // then
      sinon.assert.called(component.args.toggleOidcReconciliation);
      assert.ok(true);
    });
  });

  module('#oidcAuthenticationMethodOrganizationNames', function () {
    test('should return method organization names', function (assert) {
      // given & when
      class OidcIdentityProvidersStub extends Service {
        getIdentityProviderNamesByAuthenticationMethods() {
          return ['France Connect', 'Impots.gouv'];
        }
      }

      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
      const component = createGlimmerComponent('authentication/oidc-reconciliation');
      component.args.authenticationMethods = [EmberObject.create({ identityProvider: 'FRANCE_CONNECT' })];

      // then
      assert.ok(component.oidcAuthenticationMethodOrganizationNames.includes('France Connect'));
    });
  });

  module('#shouldShowGarAuthenticationMethod', function () {
    module('when gar authentication method exist', function () {
      test('should display authentication method', function (assert) {
        // given & when
        const component = createGlimmerComponent('authentication/oidc-reconciliation');
        component.args.authenticationMethods = [EmberObject.create({ identityProvider: 'GAR' })];

        // then
        assert.true(component.shouldShowGarAuthenticationMethod);
      });
    });

    module('when gar authentication method does not exist', function () {
      test('should not display authentication method', function (assert) {
        // given & when
        const component = createGlimmerComponent('authentication/oidc-reconciliation');
        component.args.authenticationMethods = [EmberObject.create({ identityProvider: 'OIDC' })];

        // then
        assert.false(component.shouldShowGarAuthenticationMethod);
      });
    });
  });

  module('#identityProviderOrganizationName', function () {
    test('should display identity provider organization name', function (assert) {
      // given & when
      const oidcPartner = {
        id: 'oidc-partner',
        organizationName: 'Partenaire OIDC',
      };

      class OidcIdentityProvidersStub extends Service {
        'oidc-partner' = oidcPartner;
        list = [oidcPartner];
      }

      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
      const component = createGlimmerComponent('authentication/oidc-reconciliation');
      component.args.identityProviderSlug = 'oidc-partner';

      // then
      assert.strictEqual(component.identityProviderOrganizationName, 'Partenaire OIDC');
    });
  });

  module('#shouldShowEmail', function () {
    module('when email exist', function () {
      test('should display email', function (assert) {
        // given & when
        const component = createGlimmerComponent('authentication/oidc-reconciliation');
        component.args.email = 'lloyd.ce@example.net';

        // then
        assert.true(component.shouldShowEmail);
      });
    });

    module('when email does not exist', function () {
      test('should not display email', function (assert) {
        // given & when
        const component = createGlimmerComponent('authentication/oidc-reconciliation');
        component.args.email = null;

        // then
        assert.false(component.shouldShowEmail);
      });
    });
  });

  module('#shouldShowUsername', function () {
    module('when username exist', function () {
      test('should display username', function (assert) {
        // given & when
        const component = createGlimmerComponent('authentication/oidc-reconciliation');
        component.args.username = 'lloyd.ce1122';

        // then
        assert.true(component.shouldShowUsername);
      });
    });

    module('when username does not exist', function () {
      test('should not display username', function (assert) {
        // given & when
        const component = createGlimmerComponent('authentication/oidc-reconciliation');
        component.args.username = null;

        // then
        assert.false(component.shouldShowUsername);
      });
    });
  });

  module('#reconcile', function () {
    module('completes successfully', function () {
      test('user authenticates with reconciliation', async function (assert) {
        // given
        const component = createGlimmerComponent('authentication/oidc-reconciliation');
        const sessionService = stubSessionService(this.owner, { isAuthenticated: false });

        component.args.identityProviderSlug = 'super-idp';
        component.args.authenticationKey = 'super-key';
        component.isTermsOfServiceValidated = true;

        // when
        await component.reconcile();

        // then
        sinon.assert.calledWith(sessionService.authenticate, 'authenticator:oidc', {
          authenticationKey: 'super-key',
          identityProviderSlug: 'super-idp',
          hostSlug: 'user/reconcile',
        });
        assert.false(component.isLoading);
      });
    });
    module('when there are errors', function () {
      module('when authentication key has expired', function () {
        test('should display error', async function (assert) {
          // given
          const component = createGlimmerComponent('authentication/oidc-reconciliation');
          const sessionService = stubSessionService(this.owner, { isAuthenticated: false });
          sessionService.authenticate.rejects({ errors: [{ status: '401', code: 'EXPIRED_AUTHENTICATION_KEY' }] });

          component.args.identityProviderSlug = 'super-idp';
          component.args.authenticationKey = 'super-key';
          component.isTermsOfServiceValidated = true;

          // when
          await component.reconcile();

          // then
          assert.strictEqual(
            component.reconcileErrorMessage,
            t('pages.oidc-signup-or-login.error.expired-authentication-key'),
          );
          assert.false(component.isLoading);
        });
      });

      module('when the error has no specific handling', function () {
        test('displays a default error message', async function (assert) {
          // given
          const component = createGlimmerComponent('authentication/oidc-reconciliation');
          const sessionService = stubSessionService(this.owner, { isAuthenticated: false });
          sessionService.authenticate.rejects({ errors: [{ status: '500' }] });

          component.args.identityProviderSlug = 'super-idp';
          component.args.authenticationKey = 'super-key';
          component.isTermsOfServiceValidated = true;

          // when
          await component.reconcile();

          // then
          assert.deepEqual(
            component.reconcileErrorMessage,
            t('common.api-error-messages.login-unexpected-error', {
              supportHomeUrl: 'https://pix.org/fr/support',
              htmlSafe: true,
            }),
          );

          assert.false(component.isLoading);
        });
      });
    });
    module('while waiting for submission completion', function () {
      test('isLoading is true', async function (assert) {
        // given
        let inflightLoading;
        const component = createGlimmerComponent('authentication/oidc-reconciliation');
        const sessionService = stubSessionService(this.owner, { isAuthenticated: false });
        sessionService.authenticate = function () {
          inflightLoading = component.isLoading;
          return Promise.resolve();
        };

        // when
        await component.reconcile();

        // then
        assert.true(inflightLoading);
      });
    });
  });
});
