import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | organization-learner', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:organization-learner');
    adapter.ajax = sinon.stub().resolves();
  });

  module('#urlForCreateRecord', function () {
    test('should redirect to /api/organization-learners/reconcile', async function (assert) {
      // when
      const url = await adapter.urlForCreateRecord();
      // then
      assert.true(url.endsWith('/api/organization-learners/reconcile'));
    });
  });
});
