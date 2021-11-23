import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapters | skill-set', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:skill-set');
  });

  module('#urlForCreateRecord', function () {
    test('should build create url from badgeId', async function (assert) {
      // when
      const options = { adapterOptions: { badgeId: 66 } };
      const url = await adapter.urlForCreateRecord('skill-set', options);

      // then
      assert.true(url.endsWith('/api/admin/badges/66/skill-sets'));
    });
  });
});
