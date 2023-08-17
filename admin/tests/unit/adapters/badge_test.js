import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapters | badge', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:badge');
  });

  module('#urlForCreateRecord', function () {
    test('should build create url from targetProfileId', async function (assert) {
      // when
      const options = { adapterOptions: { targetProfileId: 788 } };
      const url = await adapter.urlForCreateRecord('badge', options);

      // then
      assert.true(url.endsWith('/api/admin/target-profiles/788/badges'));
    });
  });
});
