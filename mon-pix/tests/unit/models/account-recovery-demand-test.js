import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import { run } from '@ember/runloop';
import ENV from 'mon-pix/config/environment';

describe('Unit | Model | account recovery demand', function () {
  setupTest();

  describe('#send', function () {
    it('sends account recovery email', async function () {
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
        })
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
    });

    it('updates password', async function () {
      // given
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('account-recovery-demand');
      sinon.stub(adapter, 'ajax');
      adapter.ajax.resolves();

      const accountRecoveryDemand = run(() =>
        store.createRecord('account-recovery-demand', {
          password: 'thisismypassword',
          temporaryKey: 'temporarykey',
        })
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
    });
  });
});
