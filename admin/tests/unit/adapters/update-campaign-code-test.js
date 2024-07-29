import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | UpdateCampaignCode', function (hooks) {
  setupTest(hooks);
  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:update-campaign-code');
    adapter.ajax = sinon.stub();
  });

  module('#updateCampaignCode', function () {
    test('should add campaign IDs and campaign code inside the request', function (assert) {
      // when
      const campaignId = 123;
      const campaignCode = 'YOLO';
      adapter.updateCampaignCode({ campaignId, campaignCode });
      // then
      assert.ok(
        adapter.ajax.calledWithExactly(`http://localhost:3000/api/admin/campaigns/${campaignId}/update-code`, 'PATCH', {
          data: { campaignCode },
        }),
      );
    });
  });
});
