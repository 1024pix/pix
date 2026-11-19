import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | mission', function (hooks) {
  setupTest(hooks);

  let adapter;
  let ajaxStub;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:mission');
    ajaxStub = sinon.stub().resolves();
    adapter.ajax = ajaxStub;
  });

  module('#urlForFindAll', () => {
    test('should build url from organization id', function (assert) {
      // given
      const adapterOptions = { organizationId: 4 };

      // when
      const url = adapter.urlForFindAll('mission', { adapterOptions });

      // then
      assert.ok(url.endsWith('/api/organizations/4/missions'));
    });
  });

  module('#queryRecord', () => {
    test('should call url with organization and mission ids, without them in query params', async function (assert) {
      // given
      const query = { organizationId: 4, missionId: 12 };

      // when
      await adapter.queryRecord(null, { modelName: 'mission' }, query);

      // then
      const [url, method, options] = ajaxStub.firstCall.args;
      assert.ok(url.endsWith('/api/organizations/4/missions/12'));
      assert.strictEqual(method, 'GET');
      assert.deepEqual(options, { data: {} });
      assert.deepEqual(query, { organizationId: 4, missionId: 12 });
    });
  });
});
