import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupIntl from '../../../helpers/setup-intl';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Controller | authentication | login-or-register-oidc', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#onLogin', function () {
    test('should request api for login', async function (assert) {
      // given
      const oidcPartner = {
        id: 'oidc-partner',
        code: 'OIDC_PARTNER',
      };

      class OidcIdentityProvidersStub extends Service {
        'oidc-partner' = oidcPartner;
        list = [oidcPartner];
      }

      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);

      const email = 'glace.alo@example.net';
      const password = 'pix123';
      const identityProvider = 'OIDC_PARTNER';
      const authenticationKey = '1234567azerty';
      const controller = this.owner.lookup('controller:authentication/login-or-register-oidc');
      const login = sinon.stub().resolves({
        email,
        username: 'glace.alo345',
        fullNameFromExternalIdentityProvider: 'Glace Idp',
        fullNameFromPix: 'Glace Alo',
        authenticationMethods: [{ identityProvider: 'OIDC_PARTNER' }],
      });
      controller.authenticationKey = authenticationKey;
      controller.identityProviderSlug = 'oidc-partner';
      sinon.stub(controller.store, 'createRecord').returns({ login });

      // when
      await controller.onLogin({ enteredEmail: email, enteredPassword: password });

      // then
      sinon.assert.calledWith(controller.store.createRecord, 'user-oidc-authentication-request', {
        password,
        email,
        authenticationKey,
        identityProvider,
      });
      sinon.assert.calledOnce(login);
      assert.strictEqual(controller.email, 'glace.alo@example.net');
      assert.strictEqual(controller.username, 'glace.alo345');
      assert.strictEqual(controller.fullNameFromExternalIdentityProvider, 'Glace Idp');
      assert.strictEqual(controller.fullNameFromPix, 'Glace Alo');
      assert.deepEqual(controller.authenticationMethods, [{ identityProvider: 'OIDC_PARTNER' }]);
      assert.ok(true);
    });

    test('should redirect to oidc reconciliation page', async function (assert) {
      // given
      const oidcPartner = {
        id: 'oidc-partner',
        code: 'OIDC_PARTNER',
      };

      class OidcIdentityProvidersStub extends Service {
        'oidc-partner' = oidcPartner;
        list = [oidcPartner];
      }

      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);

      const email = 'glace.alo@example.net';
      const password = 'pix123';
      const controller = this.owner.lookup('controller:authentication/login-or-register-oidc');
      const login = sinon.stub().resolves({
        email,
        username: 'glace.alo345',
        fullNameFromExternalIdentityProvider: 'Glace Idp',
        fullNameFromPix: 'Glace Alo',
        authenticationMethods: [{ identityProvider: 'oidc' }],
      });
      controller.store = { createRecord: () => ({ login }) };
      controller.email = email;
      controller.password = password;
      controller.showOidcReconciliation = false;
      controller.identityProviderSlug = 'oidc-partner';
      sinon.spy(controller.store, 'createRecord');

      // when
      await controller.onLogin({ enteredEmail: email, enteredPassword: password });

      // then
      assert.true(controller.showOidcReconciliation);
    });
  });
});
