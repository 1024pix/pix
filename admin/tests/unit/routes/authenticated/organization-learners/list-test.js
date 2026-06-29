import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/organization-learners/list', function (hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/organization-learners/list');
  });

  module('#model', function (hooks) {
    hooks.beforeEach(function () {
      // given
      route.store.query = sinon.stub().resolves();
    });

    module('when queryParams filters are falsy', function () {
      test('it should call store.query with empty params', async function (assert) {
        // given
        const params = {};
        const expectedQueryArgs = {
          page: { number: 1, size: 50 },
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'admin-organization-learner', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams filters are truthy', function () {
      test('it should call store.query with defined params', async function (assert) {
        // given
        const params = {
          pageNumber: 'somePageNumber',
          pageSize: 'somePageSize',
        };
        const expectedQueryArgs = {
          page: {
            number: 'somePageNumber',
            size: 'somePageSize',
          },
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'admin-organization-learner', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when an error occurs', function () {
      test('returns an empty array', async function (assert) {
        // given
        const params = {};
        route.store.query = sinon.stub().rejects();

        // when
        const learners = await route.model(params);

        // then
        assert.deepEqual(learners, []);
      });
    });
  });
});
