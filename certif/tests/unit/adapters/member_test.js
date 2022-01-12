import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | member', function (hooks) {
  setupTest(hooks);

  module('#urlForQuery', function () {
    test('should call the right url', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:member');
      const certificationCenterId = 1;

      // when
      const url = await adapter.urlForQuery({ certificationCenterId });

      // then
      assert.true(url.endsWith(`certification-centers/${certificationCenterId}/members`));
    });
  });
});
