import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/{campaignId}/profils/{campaignParticipationId}', function (hooks) {
  setupTest(hooks);

  module('Before model', function () {
    module('When places limit is reached', function () {
      test('should redirect on main campaign page', function (assert) {
        //given
        const route = this.owner.lookup('route:authenticated/campaigns/participant-profile');
        const campaignId = Symbol('CampaignId');

        const modelForStub = sinon.stub(route, 'modelFor');
        const replaceWithStub = sinon.stub(route.router, 'replaceWith');

        modelForStub.withArgs('authenticated').returns({ hasReachedMaximumPlacesLimit: true });

        //when
        route.beforeModel({ to: { params: { campaign_id: campaignId } } });

        //then
        assert.ok(replaceWithStub.calledWithExactly('authenticated.campaigns.campaign', campaignId));
      });
    });

    module('When places limit is not reached', function () {
      test('should not redirect on main campaign page', function (assert) {
        //given
        const route = this.owner.lookup('route:authenticated/campaigns/participant-profile');
        const campaignId = Symbol('CampaignId');

        const modelForStub = sinon.stub(route, 'modelFor');
        const replaceWithStub = sinon.stub(route.router, 'replaceWith');

        modelForStub.withArgs('authenticated').returns({ hasReachedMaximumPlacesLimit: false });

        //when
        route.beforeModel({ to: { params: { campaign_id: campaignId } } });

        //then
        assert.notOk(replaceWithStub.called);
      });
    });
  });
});
