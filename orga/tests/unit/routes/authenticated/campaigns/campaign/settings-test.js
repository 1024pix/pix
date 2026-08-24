import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/campaign/settings', function (hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/campaigns/campaign/settings');
  });

  module('beforeModel', function () {
    module('When campaign is from combined course', function () {
      test('should redirect on main campaign page', function (assert) {
        //given
        const campaignId = Symbol('CampaignId');

        const modelForStub = sinon.stub(route, 'modelFor');
        const replaceWithStub = sinon.stub(route.router, 'replaceWith');

        modelForStub.withArgs('authenticated.campaigns.campaign').returns({ isFromCombinedCourse: true });

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

    module('When campaign is not from combined course', function () {
      test('should not redirect on main campaign page', function (assert) {
        //given
        const campaignId = Symbol('CampaignId');

        const modelForStub = sinon.stub(route, 'modelFor');
        const replaceWithStub = sinon.stub(route.router, 'replaceWith');

        modelForStub.withArgs('authenticated.campaigns.campaign').returns({ isFromCombinedCourse: false });

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
        assert.notOk(replaceWithStub.called);
      });
    });
  });
});
