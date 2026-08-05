import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntl from '../../../helpers/setup-intl';

module('Unit | Controller | authentication | oidc-signup-or-login', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#onLogin', function () {
    test('should request api for login', async function (assert) {
      // given
      const oidcPartner = {
        id: 'OIDC_PARTNER',
        code: 'OIDC_PARTNER',
        slug: 'oidc-partner',
      };
      const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
      const storeStub = Service.create({
        findAll: sinon.stub().resolves([Object.create(oidcPartner)]),
        peekAll: sinon.stub().returns([Object.create(oidcPartner)]),
      });
      oidcIdentityProvidersService.set('store', storeStub);

      const email = 'glace.alo@example.net';
      const password = 'pix123';
      const authenticationKey = '1234567azerty';
      const controller = this.owner.lookup('controller:authentication/oidc-signup-or-login');
      const service = this.owner.lookup('service:user-oidc-authentication-request');

      service.login = sinon.stub().resolves({
        email,
        username: 'glace.alo345',
        fullNameFromExternalIdentityProvider: 'Glace Idp',
        fullNameFromPix: 'Glace Alo',
        authenticationMethods: [{ identityProvider: 'OIDC_PARTNER' }],
      });

      sinon.stub(controller, 'authenticationKey').get(function () {
        return authenticationKey;
      });
      controller.identityProviderSlug = 'oidc-partner';

      // when
      await controller.onLogin({ enteredEmail: email, enteredPassword: password });

      // then
      sinon.assert.calledOnce(service.login);
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
        id: 'OIDC_PARTNER',
        code: 'OIDC_PARTNER',
        slug: 'oidc-partner',
      };
      const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
      const storeStub = Service.create({
        findAll: sinon.stub().resolves([Object.create(oidcPartner)]),
        peekAll: sinon.stub().returns([Object.create(oidcPartner)]),
      });
      oidcIdentityProvidersService.set('store', storeStub);

      const email = 'glace.alo@example.net';
      const password = 'pix123';
      const authenticationKey = '1234567azerty';
      const controller = this.owner.lookup('controller:authentication/oidc-signup-or-login');
      const service = this.owner.lookup('service:user-oidc-authentication-request');
      service.login = sinon.stub().resolves({
        email,
        username: 'glace.alo345',
        fullNameFromExternalIdentityProvider: 'Glace Idp',
        fullNameFromPix: 'Glace Alo',
        authenticationMethods: [{ identityProvider: 'oidc' }],
      });
      controller.email = email;
      controller.password = password;
      controller.showOidcReconciliation = false;
      controller.identityProviderSlug = 'oidc-partner';
      sinon.stub(controller, 'authenticationKey').get(function () {
        return authenticationKey;
      });

      // when
      await controller.onLogin({ enteredEmail: email, enteredPassword: password });

      // then
      assert.true(controller.showOidcReconciliation);
    });
  });
});
