import { setupTest } from 'ember-qunit';
import ENV from 'mon-pix/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | accountRecoveryDemand', function (hooks) {
  setupTest(hooks);

  module('send', function () {
    test('it requests API', async function (assert) {
      this.requestManagerStub = { request: sinon.stub().resolves() };
      this.owner.register('service:request-manager', this.requestManagerStub, { instantiate: false });

      const service = this.owner.lookup('service:account-recovery-demand');
      this.requestManagerStub.request = sinon.stub().resolves();

      await service.send({
        firstName: 'firstName',
        lastName: 'lastName',
        ineIna: 'ineIna',
        birthdate: '2000-01-01',
        email: 'first@email.com',
      });

      assert.true(
        this.requestManagerStub.request.calledWith({
          url: `${ENV.APP.API_HOST}/api/account-recovery`,
          method: 'POST',
          body: JSON.stringify({
            data: {
              type: 'account-recovery-demands',
              attributes: {
                'ine-ina': 'ineIna',
                'first-name': 'firstName',
                'last-name': 'lastName',
                birthdate: '2000-01-01',
                email: 'first@email.com',
              },
            },
          }),
        }),
      );
    });
  });

  module('update', function () {
    test('it requests API', async function (assert) {
      this.requestManagerStub = { request: sinon.stub().resolves() };
      this.owner.register('service:request-manager', this.requestManagerStub, { instantiate: false });

      const service = this.owner.lookup('service:account-recovery-demand');
      this.requestManagerStub.request = sinon.stub().resolves();

      await service.update({ password: 'password', temporaryKey: 'temp' });

      assert.true(
        this.requestManagerStub.request.calledWith({
          url: `${ENV.APP.API_HOST}/api/account-recovery`,
          method: 'PATCH',
          body: JSON.stringify({
            data: {
              type: 'account-recovery-demands',
              attributes: {
                password: 'password',
                'temporary-key': 'temp',
              },
            },
          }),
        }),
      );
    });
  });
});
