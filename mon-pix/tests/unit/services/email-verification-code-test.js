import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import ENV from 'mon-pix/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | emailVerificationCode', function (hooks) {
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

  module('sendNewEmail', function () {
    test('it sends PUT to /api/users/:userId/email/verification-code', async function (assert) {
      this.requestManagerStub = { request: sinon.stub().resolves() };
      this.owner.register('service:request-manager', this.requestManagerStub, { instantiate: false });

      const service = this.owner.lookup('service:email-verification-code');
      this.requestManagerStub.request = sinon.stub().resolves();

      await service.sendNewEmail({ password: 'password', newEmail: 'new@email.com', action: 'add-email' });

      assert.true(
        this.requestManagerStub.request.calledWith({
          url: `${ENV.APP.API_HOST}/api/users/42/email/verification-code`,
          method: 'PUT',
          body: JSON.stringify({
            data: {
              type: 'email-verification-codes',
              attributes: {
                password: 'password',
                'new-email': 'new@email.com',
                action: 'add-email',
              },
            },
          }),
        }),
      );
    });
  });

  module('verifyCode', function () {
    test('it sends POST to /api/users/:userId/update-email when action is update-email', async function (assert) {
      this.requestManagerStub = { request: sinon.stub().resolves() };
      this.owner.register('service:request-manager', this.requestManagerStub, { instantiate: false });

      const service = this.owner.lookup('service:email-verification-code');
      this.requestManagerStub.request = sinon.stub().resolves({
        content: {
          data: {
            attributes: {
              email: 'new@email.com',
            },
          },
        },
      });

      const email = await service.verifyCode({ code: '1234', action: 'update-email' });

      assert.strictEqual(email, 'new@email.com');
      assert.true(
        this.requestManagerStub.request.calledWith({
          url: `${ENV.APP.API_HOST}/api/users/42/update-email`,
          method: 'POST',
          body: JSON.stringify({
            data: {
              type: 'email-verification-codes',
              attributes: {
                code: '1234',
              },
            },
          }),
        }),
      );
    });

    test('it sends POST to /api/users/:userId/add-email-connection-method when action is add-email', async function (assert) {
      this.requestManagerStub = { request: sinon.stub().resolves() };
      this.owner.register('service:request-manager', this.requestManagerStub, { instantiate: false });

      const service = this.owner.lookup('service:email-verification-code');
      this.requestManagerStub.request = sinon.stub().resolves({
        content: {
          data: {
            attributes: {
              email: 'new@email.com',
            },
          },
        },
      });

      const email = await service.verifyCode({ code: '1234', action: 'add-email' });

      assert.strictEqual(email, 'new@email.com');
      assert.true(
        this.requestManagerStub.request.calledWith({
          url: `${ENV.APP.API_HOST}/api/users/42/add-email-connection-method`,
          method: 'POST',
          body: JSON.stringify({
            data: {
              type: 'email-verification-codes',
              attributes: {
                code: '1234',
              },
            },
          }),
        }),
      );
    });
  });
});
