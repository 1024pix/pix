import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import setupIntl from '../../../helpers/setup-intl';
import sinon from 'sinon';
import Service from '@ember/service';

describe('Unit | Controller | authentication | login-or-register-oidc', function () {
  setupTest();
  setupIntl();

  describe('#onLogin', function () {
    it('should request api for login', async function () {
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
      controller.store = { createRecord: () => ({ login }) };
      controller.authenticationKey = authenticationKey;
      controller.identityProviderSlug = 'oidc-partner';
      sinon.spy(controller.store, 'createRecord');

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
      expect(controller.email).to.equal('glace.alo@example.net');
      expect(controller.username).to.equal('glace.alo345');
      expect(controller.fullNameFromExternalIdentityProvider).to.equal('Glace Idp');
      expect(controller.fullNameFromPix).to.equal('Glace Alo');
      expect(controller.authenticationMethods).to.deep.equal([{ identityProvider: 'OIDC_PARTNER' }]);
    });

    it('should redirect to oidc reconciliation page', async function () {
      // given
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
      sinon.spy(controller.store, 'createRecord');

      // when
      await controller.onLogin({ enteredEmail: email, enteredPassword: password });

      // then
      expect(controller.showOidcReconciliation).to.equal(true);
    });
  });
});
