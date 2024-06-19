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
        .withArgs('campaign-profiles-collection-participation-summary', {
          page: {
            number: params.pageNumber,
            size: params.pageSize,
          },
          filter: {
            divisions: params.divisions,
            groups: params.groups,
            campaignId: params.campaignId,
            search: params.search,
            certificability: params.certificability,
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
});
