import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | analysis-by-tube', function (hooks) {
  setupTest(hooks);

  let adapter;
  let ajaxStub;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:analysis-by-tube');
    ajaxStub = sinon.stub().resolves();
    adapter.ajax = ajaxStub;
  });

  module('#queryRecord', () => {
    test('should call url with organization id, without it in query params', async function (assert) {
      // given
      const query = { organizationId: 'organizationId1' };

      // when
      await adapter.queryRecord(null, { modelName: 'analysis-by-tube' }, query);

      // then
      const [url, method, options] = ajaxStub.firstCall.args;
      assert.ok(url.endsWith('/api/organizations/organizationId1/organization-learners-level-by-tubes'));
      assert.strictEqual(method, 'GET');
      assert.deepEqual(options, { data: {} });
      assert.deepEqual(query, { organizationId: 'organizationId1' });
    });
  });
});
