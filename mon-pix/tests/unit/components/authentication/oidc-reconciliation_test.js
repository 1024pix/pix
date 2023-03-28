import { module, test } from 'qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import { setupTest } from 'ember-qunit';
import setupIntl from '../../../helpers/setup-intl';
import sinon from 'sinon';
import Service from '@ember/service';
import EmberObject from '@ember/object';

module('Unit | Component | authentication | oidc-reconciliation', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#backToLoginOrRegisterForm', function () {
    test('should redirect back to login or register page', function (assert) {
      // given
      const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
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
      const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
      component.args.authenticationMethods = [EmberObject.create({ identityProvider: 'FRANCE_CONNECT' })];

      // then
      assert.ok(component.oidcAuthenticationMethodOrganizationNames.includes('France Connect'));
    });
  });

  module('#shouldShowGarAuthenticationMethod', function () {
    module('when gar authentication method exist', function () {
      test('should display authentication method', function (assert) {
        // given & when
        const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
        component.args.authenticationMethods = [EmberObject.create({ identityProvider: 'GAR' })];

        // then
        assert.true(component.shouldShowGarAuthenticationMethod);
      });
    });

    module('when gar authentication method does not exist', function () {
      test('should not display authentication method', function (assert) {
        // given & when
        const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
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
      const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
      component.args.identityProviderSlug = 'oidc-partner';

      // then
      assert.strictEqual(component.identityProviderOrganizationName, 'Partenaire OIDC');
    });
  });

  module('#shouldShowEmail', function () {
    module('when email exist', function () {
      test('should display email', function (assert) {
        // given & when
        const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
        component.args.email = 'lloyd.ce@example.net';

        // then
        assert.true(component.shouldShowEmail);
      });
    });

    module('when email does not exist', function () {
      test('should not display email', function (assert) {
        // given & when
        const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
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
        const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
        component.args.username = 'lloyd.ce1122';

        // then
        assert.true(component.shouldShowUsername);
      });
    });

    module('when username does not exist', function () {
      test('should not display username', function (assert) {
        // given & when
        const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
        component.args.username = null;

        // then
        assert.false(component.shouldShowUsername);
      });
    });
  });

  module('when authentication key has expired', function () {
    test('should display error', async function (assert) {
      // given
      const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
      const authenticateStub = sinon.stub().rejects({ errors: [{ status: '401' }] });
      class SessionStub extends Service {
        authenticate = authenticateStub;
      }
      this.owner.register('service:session', SessionStub);
      component.args.identityProviderSlug = 'super-idp';
      component.args.authenticationKey = 'super-key';
      component.isTermsOfServiceValidated = true;

      // when
      await component.reconcile();

      // then
      assert.strictEqual(
        component.reconcileErrorMessage,
        this.intl.t('pages.login-or-register-oidc.error.expired-authentication-key')
      );
    });
  });

  module('when an error happens', function () {
    test('should display generic error message', async function (assert) {
      // given
      const component = createGlimmerComponent('component:authentication/oidc-reconciliation');
      const authenticateStub = sinon.stub().rejects({ errors: [{ status: '400' }] });
      class SessionStub extends Service {
        authenticate = authenticateStub;
      }
      this.owner.register('service:session', SessionStub);
      component.args.identityProviderSlug = 'super-idp';
      component.args.authenticationKey = 'super-key';
      component.isTermsOfServiceValidated = true;

      // when
      await component.reconcile();

      // then
      assert.strictEqual(component.reconcileErrorMessage, this.intl.t('common.error'));
    });
  });
});
