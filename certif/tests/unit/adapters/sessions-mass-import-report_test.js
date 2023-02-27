import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Adapters | Sessions mass import report', function (hooks) {
  setupTest(hooks);

  module('#buildURL', function () {
    module('when request type is confirm-mass-import', function () {
      test('should build url', async function (assert) {
        // when
        const adapter = this.owner.lookup('adapter:sessions-mass-import-report');
        adapter.ajax = sinon.stub();
        const store = this.owner.lookup('service:store');
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          id: 123,
        });

        class CurrentUserStub extends Service {
          currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        }
        this.owner.register('service:current-user', CurrentUserStub);
        const url = await adapter.buildURL(undefined, undefined, undefined, 'confirm-mass-import', undefined);

        // then
        assert.true(url.endsWith('certification-centers/123/sessions/confirm-for-mass-import'));
      });
    });
  });
});
