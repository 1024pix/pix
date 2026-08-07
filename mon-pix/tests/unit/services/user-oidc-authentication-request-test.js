import { setupTest } from 'ember-qunit';
import ENV from 'mon-pix/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | UserOidcAuthenticationRequest', function (hooks) {
  setupTest(hooks);

  module('login', function () {
    test('it sends POST to /api/oidc/user/check-reconciliation', async function (assert) {
      this.requestManagerStub = { request: sinon.stub().resolves() };
      this.owner.register('service:request-manager', this.requestManagerStub, { instantiate: false });

      const service = this.owner.lookup('service:user-oidc-authentication-request');
      this.requestManagerStub.request = sinon.stub().resolves({
        content: {
          data: {
            attributes: {
              'full-name-from-pix': 'prenom',
              'full-name-from-external-identity-provider': 'prenom externe',
              email: 'prenom@nom.com',
              username: 'surnom',
              'authentication-methods': ['method1', 'method2'],
            },
          },
        },
      });

      const { email, username, authenticationMethods, fullNameFromPix, fullNameFromExternalIdentityProvider } =
        await service.login({
          password: 'password',
          email: 'prenom@nom.com',
          authenticationKey: 'key',
          identityProvider: 'provider',
        });

      assert.strictEqual(email, 'prenom@nom.com');
      assert.strictEqual(username, 'surnom');
      assert.deepEqual(authenticationMethods, ['method1', 'method2']);
      assert.strictEqual(fullNameFromPix, 'prenom');
      assert.strictEqual(fullNameFromExternalIdentityProvider, 'prenom externe');
      assert.true(
        this.requestManagerStub.request.calledWith({
          url: `${ENV.APP.API_HOST}/api/oidc/user/check-reconciliation`,
          method: 'POST',
          body: JSON.stringify({
            data: {
              type: 'user-oidc-authentication-requests',
              attributes: {
                password: 'password',
                email: 'prenom@nom.com',
                'authentication-key': 'key',
                'identity-provider': 'provider',
              },
            },
          }),
        }),
      );
    });
  });
});
