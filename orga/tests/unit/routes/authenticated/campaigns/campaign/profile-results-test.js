import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/campaign/profile-results', function (hooks) {
  setupTest(hooks);

  let route;
  let store;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/campaigns/campaign/profile-results');
    store = this.owner.lookup('service:store');
  });

  module('model', function (hooks) {
    hooks.beforeEach(function () {
      sinon.stub(store, 'query');
    });

    test('if finds profile summaries from stores', async function (assert) {
      const params = {
        pageNumber: 1,
        pageSize: 2,
        divisions: ['4eme'],
        participantExternalId: 'id123',
      };
      const expectedSummaries = [
        {
          id: 12,
        },
      ];
      const campaign = { id: Symbol('campaign') };
      sinon.stub(route, 'modelFor').withArgs('authenticated.campaigns.campaign').returns(campaign);
      store.query
        .withArgs('campaign-profiles-collection-participation-summary', {
          page: {
            number: params.pageNumber,
            size: params.pageSize,
          },
          filter: {
            campaignId: campaign.id,
            divisions: params.divisions,
            groups: params.groups,
            search: params.search,
            certificability: params.certificability,
            participantExternalId: params.participantExternalId,
          },
        })
        .resolves(expectedSummaries);

      const data = await route.model(params);

      assert.deepEqual(data, { campaign, profiles: expectedSummaries });
    });
  });

  module('loading', function (hooks) {
    hooks.beforeEach(function () {
      sinon.stub(store, 'query');
    });

    module('when the transition comes from "authenticated.campaigns.campaign.profile-results"', function () {
      test('if returns false', function (assert) {
        const transition = { from: { name: 'authenticated.campaigns.campaign.profile-results' } };
        assert.false(route.loading(transition));
      });
    });

    module('when the transition comes from somewhere else', function () {
      test('if returns undefined', function (assert) {
        const transition = { from: { name: 'authenticated.campaigns.campaign' } };

        assert.strictEqual(route.loading(transition), undefined);
      });
    });

    module('when the transition has no from attribute', function () {
      test('if keeps loading page', function (assert) {
        const transition = {};

        assert.strictEqual(route.loading(transition), undefined);
      });
    });
  });

  module('resetController', function () {
    test('should reset filter to default value when isExiting true', function (assert) {
      const controller = { set: sinon.stub() };

      route.resetController(controller, true);

      assert.ok(controller.set.calledWith('certificability', null));
      assert.ok(controller.set.calledWith('pageNumber', 1));
      assert.ok(controller.set.calledWith('pageSize', 50));
      assert.ok(controller.set.calledWith('divisions', []));
      assert.ok(controller.set.calledWith('groups', []));
      assert.ok(controller.set.calledWith('search', null));
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
