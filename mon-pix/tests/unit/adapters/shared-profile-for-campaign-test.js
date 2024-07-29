import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | shared-profile-for-campaign', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:shared-profile-for-campaign');
    adapter.ajax = sinon.stub().resolves();
  });

  module('#urlForQueryRecord', function () {
    test('should build query url from campaign and user ids', async function (assert) {
      const query = { campaignId: 'campaignId1', userId: 'userId1' };
      const url = await adapter.urlForQueryRecord(query);

      assert.true(url.endsWith('/api/users/userId1/campaigns/campaignId1/profile'));
      assert.deepEqual(query, {});
    });
    test('should build default url if no campaign and user ids', async function (assert) {
      const query = {};
      const url = await adapter.urlForQueryRecord(query);

      assert.true(url.endsWith('/api'));
    });
  });
});
