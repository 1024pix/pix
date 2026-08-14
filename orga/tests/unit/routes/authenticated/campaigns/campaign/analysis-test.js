import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/campaign/analysis', function (hooks) {
  setupTest(hooks);
  let route, currentUser;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/campaigns/campaign/analysis');
    currentUser = this.owner.lookup('service:current-user');
  });

  module('beforeModel', function () {
    module('When places limit is reached', function () {
      test('should redirect on main campaign page', function (assert) {
        //given
        const campaignId = Symbol('CampaignId');
        sinon.stub(currentUser, 'placeStatistics').value({ hasReachedMaximumPlacesLimit: true });
        const replaceWithStub = sinon.stub(route.router, 'replaceWith');

        //when
        route.beforeModel({
          to: {
            parent: {
              params: {
                campaign_id: campaignId,
              },
            },
          },
        });
        //then
        assert.ok(replaceWithStub.calledWithExactly('authenticated.campaigns.campaign', campaignId));
      });
    });

    module('When places limit is not reached', function () {
      test('should not redirect on main campaign page', function (assert) {
        //given
        const campaignId = Symbol('CampaignId');

        const modelForStub = sinon.stub(route, 'modelFor');
        const replaceWithStub = sinon.stub(route.router, 'replaceWith');

        modelForStub.withArgs('authenticated').returns({ hasReachedMaximumPlacesLimit: false });

        //when
        route.beforeModel({
          to: {
            name: 'authenticated.campaigns.campaign.analysis.tubes',
            parent: {
              params: {
                campaign_id: campaignId,
              },
            },
          },
        });

        //then
        assert.ok(replaceWithStub.calledOnceWithExactly('authenticated.campaigns.campaign.analysis.tubes'));
      });
    });
  });
});
