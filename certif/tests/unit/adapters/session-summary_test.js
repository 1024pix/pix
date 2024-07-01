import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapters | session-summary', function (hooks) {
  setupTest(hooks);

  module('#urlForQuery', function () {
    test('it should return the modified URL using the current certification center of the logged user', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: '123',
        certificationCenterName: 'Sunnydale',
      });
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

  module('#urlForDeleteRecord', function () {
    test('it should return the modified URL from session id', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:session-summary');
      const sessionId = 123;

      // when
      const url = adapter.urlForDeleteRecord(sessionId);

      // then
      assert.true(url.endsWith(`/sessions/${sessionId}`));
    });
  });
});
