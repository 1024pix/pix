import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/campaign/assessment-results', function (hooks) {
  setupTest(hooks);

  let route;
  let store;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/campaigns/campaign/assessment-results');
    store = this.owner.lookup('service:store');
  });

  module('model', function (hooks) {
    hooks.beforeEach(function () {
      sinon.stub(store, 'query');
      sinon.stub(route, 'modelFor');
    });

    test('if finds campaign-assessment-result-minimal from stores', async function (assert) {
      const campaign = { id: Symbol('campaignId') };
      const params = {
        pageNumber: 1,
        pageSize: 2,
        divisions: ['4eme'],
        groups: [],
        badges: [],
        unacquiredBadges: [],
        stages: [],
        search: null,
        participantExternalId: 123,
      };

      const expectedParticipations = [
        {
          id: 12,
        },
      ];

      route.modelFor.withArgs('authenticated.campaigns.campaign').returns(campaign);
      store.query
        .withArgs('campaign-assessment-result-minimal', {
          page: {
            number: params.pageNumber,
            size: params.pageSize,
          },
          filter: {
            divisions: params.divisions,
            groups: params.groups,
            badges: params.badges,
            stages: params.stages,
            unacquiredBadges: params.unacquiredBadges,
            search: params.search,
            participantExternalId: 123,
          },
          campaignId: campaign.id,
        })
        .resolves(expectedParticipations);

      const data = await route.model(params);

      assert.deepEqual(data, { participations: expectedParticipations, campaign });
    });
  });

  module('resetController', function () {
    module('when isExiting is true', function () {
      test('it call controller resetFiltering', function (assert) {
        const controller = { resetFiltering: sinon.stub() };
        route.resetController(controller, true);
        assert.ok(controller.resetFiltering.calledOnce);
      });
    });

    module('when isExiting is false', function () {
      test('it not call controller resetFiltering', function (assert) {
        const controller = { resetFiltering: sinon.stub() };
        route.resetController(controller, false);
        assert.ok(controller.resetFiltering.notCalled);
      });
    });
  });

  module('beforeModel', function () {
    module('When places limit is reached', function () {
      test('should redirect to main campaign page', function (assert) {
        //given
        const campaignId = Symbol('CampaignId');

        const modelForStub = sinon.stub(route, 'modelFor');
        const replaceWithStub = sinon.stub(route.router, 'replaceWith');

        modelForStub.withArgs('authenticated').returns({ hasReachedMaximumPlacesLimit: true });

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
      test('should not redirect to main campaign page', function (assert) {
        //given
        const campaignId = Symbol('CampaignId');

        const modelForStub = sinon.stub(route, 'modelFor');
        const replaceWithStub = sinon.stub(route.router, 'replaceWith');

        modelForStub.withArgs('authenticated').returns({ hasReachedMaximumPlacesLimit: false });

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
