import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/campaign/profile-results', function (hooks) {
  setupTest(hooks);

  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/campaigns/campaign/profile-results');
  });

  module('fetchProfileSummaries', function (hooks) {
    let store;
    let storeStub;

    hooks.beforeEach(function () {
      storeStub = {
        query: sinon.stub(),
      };
      store = route.store;
      route.store = storeStub;
    });

    hooks.afterEach(function () {
      route.store = store;
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

      storeStub.query
        .withArgs('CampaignProfilesCollectionParticipationSummary', {
          page: {
            number: params.pageNumber,
            size: params.pageSize,
          },
          filter: {
            divisions: params.divisions,
            groups: params.groups,
            campaignId: params.campaignId,
          },
        })
        .returns(expectedSummaries);

      const summaries = route.fetchProfileSummaries(params);

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(summaries, expectedSummaries);
    });
  });

  module('loading', function (hooks) {
    let store;
    let storeStub;

    hooks.beforeEach(function () {
      storeStub = {
        query: sinon.stub(),
      };
      store = route.store;
      route.store = storeStub;
    });

    hooks.afterEach(function () {
      route.store = store;
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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(route.loading(transition), undefined);
      });
    });

    module('when the transition has no from attribute', function () {
      test('if keeps loading page', function (assert) {
        const transition = {};
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(route.loading(transition), undefined);
      });
    });
  });
});
