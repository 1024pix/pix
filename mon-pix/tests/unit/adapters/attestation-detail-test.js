import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapter | attestation-detail', function (hooks) {
  setupTest(hooks);

  module('#urlForFindAll', function () {
    test('should send a GET request to user attestation-detail endpoint', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        user = {
          id: '1234',
        };
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const adapter = this.owner.lookup('adapter:attestation-detail');
      // when
      const url = adapter.urlForFindAll();

      // then
      assert.true(url.endsWith('api/users/1234/attestation-details'));
    });
  });
});
