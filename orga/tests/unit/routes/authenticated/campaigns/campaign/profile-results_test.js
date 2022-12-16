import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/campaign/profile-results', function (hooks) {
  setupTest(hooks);

  let route;
  let store;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/campaigns/campaign/profile-results');
    store = this.owner.lookup('service:store');
  });

  module('fetchProfileSummaries', function (hooks) {
    hooks.beforeEach(function () {
      sinon.stub(store, 'query');
    });

    test('if finds profile summaries from stores', function (assert) {
      const params = {
        pageNumber: 1,
        pageSize: 2,
        divisions: ['4eme'],
        campaignId: 3,
      };
      const expectedSummaries = [
        {
          id: 12,
        },
      ];

      store.query
        .withArgs('CampaignProfilesCollectionParticipationSummary', {
          page: {
            number: params.pageNumber,
            size: params.pageSize,
          },
          filter: {
            divisions: params.divisions,
            groups: params.groups,
            campaignId: params.campaignId,
            search: params.search,
          },
        })
        .returns(expectedSummaries);

      const summaries = route.fetchProfileSummaries(params);

      assert.strictEqual(summaries, expectedSummaries);
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
});
