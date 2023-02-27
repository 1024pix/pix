import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';
import ENV from 'pix-certif/config/environment';

-module('Unit | Model | sessions mass import report', function (hooks) {
  setupTest(hooks);

  module('#confirm', function () {
    test('confirm sessions mass import', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('sessions-mass-import-report');
      sinon.stub(adapter, 'ajax');
      adapter.ajax.resolves();

      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: 123,
      });
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const sessionsMassImportReport = await store.createRecord('sessions-mass-import-report', {
        cachedValidatedSessionsKey: 'UUID',
      });

      // when
      await sessionsMassImportReport.confirm({ cachedValidatedSessionsKey: 'UUID' });

      // then
      const url = `${ENV.APP.API_HOST}/api/certification-centers/123/sessions/confirm-for-mass-import`;
      const payload = {
        data: {
          data: {
            attributes: {
              cachedValidatedSessionsKey: 'UUID',
            },
          },
        },
      };
      sinon.assert.calledWith(adapter.ajax, url, 'POST', payload);
      assert.ok(true);
    });
  });
});
