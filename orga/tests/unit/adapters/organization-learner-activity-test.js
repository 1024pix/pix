import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | organization-learner-activity', function (hooks) {
  setupTest(hooks);

  let adapter;
  let ajaxStub;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:organization-learner-activity');
    ajaxStub = sinon.stub().resolves();
    adapter.ajax = ajaxStub;
  });

  module('#queryRecord', () => {
    test('should request the learner activity endpoint and strip organizationLearnerId from the query', async function (assert) {
      // given
      const query = { organizationLearnerId: '123' };

      // when
      await adapter.queryRecord(null, { modelName: 'organization-learner-activity' }, query);

      // then
      const [url, method, options] = ajaxStub.firstCall.args;
      assert.ok(url.endsWith('/api/organization-learners/123/activity'));
      assert.strictEqual(method, 'GET');
      assert.deepEqual(options, { data: {} });
      assert.deepEqual(query, { organizationLearnerId: '123' });
    });
  });
});
