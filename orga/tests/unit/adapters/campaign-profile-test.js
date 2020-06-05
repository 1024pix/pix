import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapters | campaign-profile', function(hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:campaign-profile');
    adapter.ajax = sinon.stub().resolves();
  });

  module('#urlForQueryRecord', () => {
    test('should build query url from campaign and campaign participation', async function(assert) {
      const query = { campaignId: 'campaignId1', campaignParticipationId: 'campaignParticipationId1' };
      const url = await adapter.urlForQueryRecord(query);

      assert.ok(url.endsWith('/api/campaigns/campaignId1/profiles-collection-participations/campaignParticipationId1'));
      assert.equal(query.campaignId, undefined);
      assert.equal(query.campaignParticipationId, undefined);
    });
  });
});
