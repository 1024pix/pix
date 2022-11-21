import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/campaign', function (hooks) {
  setupTest(hooks);

  test('should redirect to not-found page', async function (assert) {
    assert.expect(1);
    // given
    const route = this.owner.lookup('route:authenticated/campaigns/campaign');
    const store = this.owner.lookup('service:store');
    const params = { campaign_id: 'liste' };

    sinon.stub(store, 'findRecord');
    store.findRecord.rejects({ errors: [{ status: '400' }] });

    // then
    const expectedRedirection = 'not-found';
    route.replaceWith = (redirection) => {
      assert.strictEqual(
        redirection,
        expectedRedirection,
        `expect transition to ${expectedRedirection}, got ${redirection}`
      );
    };

    // when
    await route.model(params);
  });

  test('should set up isComingFromAllCampaignPage to true if transition is from all campaign page', async function (assert) {
    // given
    const route = this.owner.lookup('route:authenticated/campaigns/campaign');
    const controller = { set: sinon.stub() };
    const model = {};
    const transition = { from: { name: 'authenticated.campaigns.list.all-campaigns' } };

    // then
    route.setupController(controller, model, transition);

    // then
    assert.ok(controller.set.calledWith('isComingFromAllCampaignPage', true));
  });
});
