import { setupTest } from 'ember-qunit';
import ENV from 'mon-pix/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | resetExpiredPasswordDemand', function (hooks) {
  setupTest(hooks);

  module('updateExpiredPassword', function () {
    test('it sends POST to /api/expire-password-updates', async function (assert) {
      this.requestManagerStub = { request: sinon.stub().resolves() };
      this.owner.register('service:request-manager', this.requestManagerStub, { instantiate: false });

      const service = this.owner.lookup('service:reset-expired-password-demand');
      this.requestManagerStub.request = sinon.stub().resolves({
        content: {
          data: {
            attributes: {
              login: 'login',
            },
          },
        },
      });

      const login = await service.updateExpiredPassword({
        newPassword: 'newPassword',
        passwordResetToken: 'token',
      });

      assert.strictEqual(login, 'login');
      assert.true(
        this.requestManagerStub.request.calledWith({
          url: `${ENV.APP.API_HOST}/api/expired-password-updates`,
          method: 'POST',
          body: JSON.stringify({
            data: {
              type: 'reset-expired-password-demands',
              attributes: {
                'new-password': 'newPassword',
                'password-reset-token': 'token',
              },
            },
          }),
        }),
      );
    });
  });
});
