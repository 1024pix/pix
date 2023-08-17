import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapters | organization-learner-activity', function (hooks) {
  setupTest(hooks);

  module('#urlForQueryRecord', () => {
    test('should build query url from organizationLearnerId', async function (assert) {
      const adapter = this.owner.lookup('adapter:organization-learner-activity');
      const query = { organizationLearnerId: '123' };
      const url = await adapter.urlForQueryRecord(query);

      assert.ok(url.endsWith('/api/organization-learners/123/activity'));
      assert.strictEqual(query.organizationLearnerId, undefined);
    });
  });
});
