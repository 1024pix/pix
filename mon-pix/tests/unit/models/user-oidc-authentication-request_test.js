import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon/pkg/sinon-esm';

import ENV from '../../../config/environment';

module('Unit | Model | user-oidc-authentication-request', function (hooks) {
  setupTest(hooks);

  module('#login', function () {
    test('should login and return attributes', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('user-oidc-authentication-request');
      sinon.stub(adapter, 'ajax');
      adapter.ajax.resolves({
        data: {
          attributes: {
            'full-name-from-pix': 'Loyd Pix',
            'full-name-from-external-identity-provider': 'Loyd Cé',
            username: 'loyd.ce123',
            email: 'loyd.ce@example.net',
            'authentication-methods': [{ identityProvider: 'oidc' }],
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
      assert.deepEqual(result.email, 'loyd.ce@example.net');
      assert.deepEqual(result.fullNameFromPix, 'Loyd Pix');
      assert.deepEqual(result.fullNameFromExternalIdentityProvider, 'Loyd Cé');
      assert.deepEqual(result.username, 'loyd.ce123');
      assert.deepEqual(result.authenticationMethods, [{ identityProvider: 'oidc' }]);
      assert.ok(true);
    });
  });
});
