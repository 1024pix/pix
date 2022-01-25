import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Route | authenticated/campaigns/campaign', function (hooks) {
  setupTest(hooks);

  test('should redirect to not-found page', async function (assert) {
    assert.expect(1);
    // given
    const route = this.owner.lookup('route:authenticated/campaigns/campaign');
    const params = { campaign_id: 'liste' };

    const findRecordStub = sinon.stub();
    const storeStub = Service.create({
      findRecord: findRecordStub,
    });
    route.set('store', storeStub);
    findRecordStub.rejects({ errors: [{ status: '400' }] });

    // then
    const expectedRedirection = 'not-found';
    route.replaceWith = (redirection) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(redirection, expectedRedirection, `expect transition to ${expectedRedirection}, got ${redirection}`);
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
