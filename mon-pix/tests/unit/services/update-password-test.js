import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import ENV from 'mon-pix/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | update-password', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    class CurrentUserStub extends Service {
      user = {
        get() {
          return 42;
        },
      };
    }

    this.owner.register('service:current-user', CurrentUserStub);
  });

  test('it sends POST to /api/users/:userId/update-password', async function (assert) {
    this.requestManagerStub = { request: sinon.stub().resolves() };
    this.owner.register('service:request-manager', this.requestManagerStub, { instantiate: false });

    const service = this.owner.lookup('service:update-password');
    this.requestManagerStub.request = sinon.stub().resolves();

    await service.updatePassword({ currentPassword: 'currentPassword123', newPassword: 'newPassword123' });

    assert.true(
      this.requestManagerStub.request.calledWith({
        url: `${ENV.APP.API_HOST}/api/users/42/update-password`,
        method: 'POST',
        body: JSON.stringify({
          data: {
            type: 'password-updates',
            attributes: {
              'current-password': 'currentPassword123',
              'new-password': 'newPassword123',
            },
          },
        }),
      }),
    );
  });
});
