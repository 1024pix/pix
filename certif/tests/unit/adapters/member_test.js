import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | member', function(hooks) {
  setupTest(hooks);

  module('#urlForFindAll', function() {

    test('should call the right url', async function(assert) {
      // given
      const adapter = this.owner.lookup('adapter:member');
      const certificationCenterId = 1;
      const adapterOptions = { certificationCenterId };

      // when
      const url = await adapter.urlForFindAll('member', { adapterOptions });

      // then
      assert.true(url.endsWith(`certification-centers/${certificationCenterId}/members`));
    });
  });
});
