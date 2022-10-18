import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | join', function (hooks) {
  setupTest(hooks);

  module('#model', function () {
    test('it should return certification center name', async function (assert) {
      // given
      const route = this.owner.lookup('route:join');

      // when
      const { certificationCenterName } = await route.model();

      // then
      assert.strictEqual(certificationCenterName, 'PLACEHOLDER_CERTIF_CENTER_NAME');
    });
  });
});
