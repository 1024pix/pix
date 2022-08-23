import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import setupIntl from '../../../helpers/setup-intl';
import sinon from 'sinon';

describe('Unit | Controller | authentication::login-or-register-oidc', function () {
  setupTest();
  setupIntl();

  describe('#onLogin', function () {
    it('should request api for login', async function () {
      // given
      const email = 'glace.alo@example.net';
      const password = 'pix123';
      const identityProvider = 'CNAV';
      const authenticationKey = '1234567azerty';
      const controller = this.owner.lookup('controller:authentication/login-or-register-oidc');
      const login = sinon.stub();
      controller.store = { createRecord: () => ({ login }) };
      controller.authenticationKey = authenticationKey;
      controller.identityProviderSlug = 'cnav';
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
    });

    it('should redirect to oidc reconciliation page', async function () {
      // given
      const email = 'glace.alo@example.net';
      const password = 'pix123';
      const controller = this.owner.lookup('controller:authentication/login-or-register-oidc');
      const login = sinon.stub();
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
