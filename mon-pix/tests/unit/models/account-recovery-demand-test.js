import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import { run } from '@ember/runloop';
import ENV from 'mon-pix/config/environment';

module('Unit | Model | account recovery demand', function (hooks) {
  setupTest(hooks);

  module('#send', function () {
    test('sends account recovery email', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('account-recovery-demand');
      sinon.stub(adapter, 'ajax');
      adapter.ajax.resolves();

      const accountRecoveryDemand = run(() =>
        store.createRecord('account-recovery-demand', {
          firstName: 'Jude',
          lastName: 'Law',
          ineIna: '123456789BB',
          birthdate: '2012-07-01',
          email: 'james.potter@example.net',
        }),
      );

      // when
      await accountRecoveryDemand.send();

      // then
      const url = `${ENV.APP.API_HOST}/api/account-recovery`;
      const payload = {
        data: {
          data: {
            attributes: {
              'first-name': 'Jude',
              'last-name': 'Law',
              'ine-ina': '123456789BB',
              birthdate: '2012-07-01',
              email: 'james.potter@example.net',
            },
            type: 'account-recovery-demands',
          },
        },
      };
      sinon.assert.calledWith(adapter.ajax, url, 'POST', payload);
      assert.ok(true);
    });

    test('updates password', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('account-recovery-demand');
      sinon.stub(adapter, 'ajax');
      adapter.ajax.resolves();

      const accountRecoveryDemand = run(() =>
        store.createRecord('account-recovery-demand', {
          password: 'thisismypassword',
          temporaryKey: 'temporarykey',
        }),
      );

      // when
      await accountRecoveryDemand.update();

      // then
      const url = `${ENV.APP.API_HOST}/api/account-recovery`;
      const payload = {
        data: {
          data: {
            attributes: {
              password: 'thisismypassword',
              'temporary-key': 'temporarykey',
            },
            type: 'account-recovery-demands',
          },
        },
      };
      sinon.assert.calledWith(adapter.ajax, url, 'PATCH', payload);
      assert.ok(true);
    });
  });
});
