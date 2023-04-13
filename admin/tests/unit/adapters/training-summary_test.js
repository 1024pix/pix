import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | TrainingSummary', function (hooks) {
  setupTest(hooks);
  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:training-summary');
  });

  module('#urlForQuery', function () {
    test('should build query url from targetProfileId', async function (assert) {
      const query = { targetProfileId: 123 };
      const url = await adapter.urlForQuery(query, 'training-summary');

      assert.ok(url.endsWith('/api/admin/target-profiles/123/training-summaries'));
      assert.strictEqual(query.targetProfileId, undefined);
    });

    test('should build query url', async function (assert) {
      const url = await adapter.urlForQuery({}, 'training-summary');

      assert.ok(url.endsWith('/api/admin/training-summaries'));
    });
  });
});
