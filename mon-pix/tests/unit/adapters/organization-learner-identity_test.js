import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapters | organization-learner-identity', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:organization-learner-identity');
  });

  module('#urlForQueryRecord', function () {
    test('should redirect to /api/organization-learners', async function (assert) {
      // when
      const url = await adapter.urlForQueryRecord();
      // then
      assert.true(url.endsWith('/organization-learners'));
    });
  });
});
