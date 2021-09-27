import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/campaign/assessment-results', function (hooks) {
  setupTest(hooks);

  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/campaigns/campaign/assessment-results');
  });

  module('fetchResultMinimalList', function (hooks) {
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

    test('if finds summaries from stores', function (assert) {
      const params = {
        pageNumber: 1,
        pageSize: 2,
        divisions: ['4eme'],
        badges: [],
        stages: [],
        campaignId: 3,
      };
      const expectedParticipations = [
        {
          id: 12,
        },
      ];

      storeStub.query
        .withArgs('campaignAssessmentResultMinimal', {
          page: {
            number: params.pageNumber,
            size: params.pageSize,
          },
          filter: {
            divisions: params.divisions,
            badges: params.badges,
            stages: params.stages,
          },
          campaignId: params.campaignId,
        })
        .returns(expectedParticipations);

      const participations = route.fetchResultMinimalList(params);

      assert.equal(participations, expectedParticipations);
    });
  });
});
