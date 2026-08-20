import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import ENV from 'pix-certif/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | Sessions mass import report', function (hooks) {
  setupTest(hooks);

  module('#confirm', function () {
    test('should call /sessions/confirm-for-mass-import API', async function (assert) {
      // when
      const adapter = this.owner.lookup('adapter:sessions-mass-import-report');
      adapter.ajax = sinon.stub();
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: '123',
      });

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      await adapter.confirm({ cachedValidatedSessionsKey: 'UUID' });

      // then
      assert.ok(
        adapter.ajax.calledWithExactly(
          `${ENV.APP.API_HOST}/api/certification-centers/123/sessions/confirm-for-mass-import`,
          'POST',
          { data: { data: { attributes: { cachedValidatedSessionsKey: 'UUID' } } } },
        ),
      );
    });
  });
});
