import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { resolve } from 'rsvp';

module('Unit | Adapters | AvailableCampaignParticipation', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:available-campaign-participation');
    const ajaxStub = () => resolve();
    adapter.ajax = ajaxStub;
  });

  module('#urlForQuery', function () {
    test('should build url with campaign id and organization learner id', async function (assert) {
      // when
      const query = { campaignId: 1, organizationLearnerId: 2 };
      const url = await adapter.urlForQuery(query);

      // then
      assert.true(url.endsWith(`/campaigns/1/organization-learners/2/participations`));
      assert.strictEqual(query.campaignId, undefined);
    });
  });
});
