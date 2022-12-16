import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/campaigns/campaign', function (hooks) {
  setupTest(hooks);

  test('it should return the all-campaigns route name when coming from there', function (assert) {
    // given
    const controller = this.owner.lookup('controller:authenticated/campaigns/campaign');
    controller.isComingFromAllCampaignPage = true;

    // when / then
    assert.strictEqual(controller.previousRouteName, 'authenticated.campaigns.list.all-campaigns');
  });

  test('it should return campaigns route by default', function (assert) {
    // given
    const controller = this.owner.lookup('controller:authenticated/campaigns/campaign');

    // when / then
    assert.strictEqual(controller.previousRouteName, 'authenticated.campaigns');
  });
});
