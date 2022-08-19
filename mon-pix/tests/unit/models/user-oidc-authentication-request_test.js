import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { expect } from 'chai';
import sinon from 'sinon/pkg/sinon-esm';
import ENV from '../../../config/environment';

describe('Unit | Model | user-oidc-authentication-request', function () {
  setupTest();

  describe('#login', function () {
    it('should login and return attributes', async function () {
      // given
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('user-oidc-authentication-request');
      sinon.stub(adapter, 'ajax');
      adapter.ajax.resolves({
        data: {
          attributes: {
            accessToken: 'accessToken',
            logoutUrlUuid: 'url',
          },
        },
      });

      const userOidcAuthenticationRequest = store.createRecord('user-oidc-authentication-request', {
        password: 'pix123',
        email: 'glace.alo@example.net',
        authenticationKey: '123456azerty',
        identityProvider: 'oidc-partner',
      });

      // when
      const result = await userOidcAuthenticationRequest.login();

      // then
      const url = `${ENV.APP.API_HOST}/api/oidc/user/check-reconciliation`;
      const payload = {
        data: {
          data: {
            attributes: {
              password: 'pix123',
              email: 'glace.alo@example.net',
              'authentication-key': '123456azerty',
              'identity-provider': 'oidc-partner',
            },
            type: 'user-oidc-authentication-requests',
          },
        },
      };
      sinon.assert.calledWith(adapter.ajax, url, 'POST', payload);
      expect(result).to.deep.equal({
        accessToken: 'accessToken',
        logoutUrlUuid: 'url',
      });
    });
  });
});
