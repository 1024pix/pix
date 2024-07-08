import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
// import sinon from 'sinon';

module('Unit | Adapters | organization-learner-identity', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:organization-learner-identity');
    // adapter.ajax = sinon.stub().resolves();
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
