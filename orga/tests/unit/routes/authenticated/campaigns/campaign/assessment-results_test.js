import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/campaigns/campaign/assessment-results', function (hooks) {
  setupTest(hooks);

  let route;
  let store;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/campaigns/campaign/assessment-results');
    store = this.owner.lookup('service:store');
  });

  module('fetchResultMinimalList', function (hooks) {
    hooks.beforeEach(function () {
      sinon.stub(store, 'query');
    });

    test('if finds summaries from stores', function (assert) {
      const params = {
        pageNumber: 1,
        pageSize: 2,
        divisions: ['4eme'],
        groups: [],
        badges: [],
        stages: [],
        search: null,
        campaignId: 3,
      };
      const expectedParticipations = [
        {
          id: 12,
        },
      ];

      store.query
        .withArgs('campaignAssessmentResultMinimal', {
          page: {
            number: params.pageNumber,
            size: params.pageSize,
          },
          filter: {
            divisions: params.divisions,
            groups: params.groups,
            badges: params.badges,
            stages: params.stages,
            search: params.search,
          },
          campaignId: params.campaignId,
        })
        .returns(expectedParticipations);

      const participations = route.fetchResultMinimalList(params);

      assert.strictEqual(participations, expectedParticipations);
    });
  });

  module('resetController', function () {
    module('when isExiting is true', function () {
      test('it reset pageNumber', function (assert) {
        const controller = { pageNumber: 2 };
        route.resetController(controller, true);
        assert.strictEqual(controller.pageNumber, 1);
      });

      test('it reset pageSize', function (assert) {
        const controller = { pageSize: 10 };
        route.resetController(controller, true);
        assert.strictEqual(controller.pageSize, 50);
      });

      test('it reset divisions', function (assert) {
        const controller = { divisions: ['10'] };
        route.resetController(controller, true);
        assert.deepEqual(controller.divisions, []);
      });

      test('it reset groups', function (assert) {
        const controller = { groups: ['10'] };
        route.resetController(controller, true);
        assert.deepEqual(controller.groups, []);
      });

      test('it reset badges', function (assert) {
        const controller = { badges: ['10'] };
        route.resetController(controller, true);
        assert.deepEqual(controller.badges, []);
      });

      test('it reset stages', function (assert) {
        const controller = { stages: ['10'] };
        route.resetController(controller, true);
        assert.deepEqual(controller.stages, []);
      });

      test('it reset search', function (assert) {
        const controller = { search: 'Dalida' };
        route.resetController(controller, true);
        assert.deepEqual(controller.search, null);
      });
    });

    module('when isExiting is false', function () {
      test('it does not reset pageNumber', function (assert) {
        const controller = { pageNumber: 2 };
        route.resetController(controller, false);
        assert.strictEqual(controller.pageNumber, 2);
      });

      test('it does not reset pageSize', function (assert) {
        const controller = { pageSize: 10 };
        route.resetController(controller, false);
        assert.strictEqual(controller.pageSize, 10);
      });

      test('it does not reset divisions', function (assert) {
        const controller = { divisions: ['10'] };
        route.resetController(controller, false);
        assert.deepEqual(controller.divisions, ['10']);
      });

      test('it does not reset groups', function (assert) {
        const controller = { groups: ['10'] };
        route.resetController(controller, false);
        assert.deepEqual(controller.groups, ['10']);
      });

      test('it does not reset badges', function (assert) {
        const controller = { badges: ['10'] };
        route.resetController(controller, false);
        assert.deepEqual(controller.badges, ['10']);
      });

      test('it does not reset stages', function (assert) {
        const controller = { stages: ['10'] };
        route.resetController(controller, false);
        assert.deepEqual(controller.stages, ['10']);
      });

      test('it does not reset search', function (assert) {
        const controller = { search: 'Dalida' };
        route.resetController(controller, false);
        assert.deepEqual(controller.search, 'Dalida');
      });
    });
  });
});
