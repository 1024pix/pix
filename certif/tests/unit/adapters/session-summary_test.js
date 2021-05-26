import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Adapters | session-summary', function(hooks) {
  setupTest(hooks);

  module('#urlForQuery', function() {

    test('it should return the modified URL using the current certification center of the logged user', async function(assert) {
      // given
      class CurrentUserStub extends Service {
        currentCertificationCenter = { id: 123 };
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const adapter = this.owner.lookup('adapter:session-summary');

      // when
      const url = await adapter.urlForQuery();

      // then
      assert.equal(url.endsWith('/api/certification-centers/123/session-summaries'), true);
    });
  });
});
