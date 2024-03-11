import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapters | campaign-participant-activity', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:campaign-participant-activity');
  });

  module('#urlForQuery', () => {
    test('should build query url from campaign', async function (assert) {
      const query = { campaignId: 'campaignId1' };
      const url = await adapter.urlForQuery(query);

      assert.ok(url.endsWith('/api/campaigns/campaignId1/participants-activity'));

      assert.strictEqual(query.campaignId, undefined);
    });
  });

  module('#urlForDeleteRecord', () => {
    test('should build query url from adapterOptions', async function (assert) {
      const adapterOptions = { campaignId: 'campaignId1', campaignParticipationId: 'campaignParticipationId1' };
      const url = await adapter.urlForDeleteRecord(null, null, { adapterOptions });

      assert.ok(url.endsWith('/api/campaigns/campaignId1/campaign-participations/campaignParticipationId1'));
    });
  });
});
