import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import Service from '@ember/service';

module('Unit | Adapters | session-summary', function (hooks) {
  setupTest(hooks);

  module('#urlForQuery', function () {
    test('it should return the modified URL using the current certification center of the logged user', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = run(() =>
        store.createRecord('allowed-certification-center-access', {
          id: 123,
          certificationCenterName: 'Sunnydale',
        })
      );
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const adapter = this.owner.lookup('adapter:session-summary');

      // when
      const url = await adapter.urlForQuery();

      // then
      assert.true(url.endsWith('/api/certification-centers/123/session-summaries'));
    });
  });
});
