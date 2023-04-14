import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/trainings/list', function (hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/trainings/list');
  });

  module('#model', function (hooks) {
    const params = {};
    const expectedQueryArgs = {};

    hooks.beforeEach(function () {
      route.store.query = sinon.stub().resolves();
      params.pageNumber = 'somePageNumber';
      params.pageSize = 'somePageSize';
      expectedQueryArgs.page = {
        number: 'somePageNumber',
        size: 'somePageSize',
      };
    });

    module('when queryParams filters are falsy', function () {
      test('it should call store.query with no filters on name and id', async function (assert) {
        // when
        await route.model(params);
        expectedQueryArgs.filter = {
          title: '',
          id: '',
        };

        // then
        sinon.assert.calledWith(route.store.query, 'training-summary', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams filters are truthy', function () {
      test('it should call store.query with filters containing trimmed values', async function (assert) {
        // given
        params.title = 'someTitle';
        params.id = 'someId';
        expectedQueryArgs.filter = {
          title: 'someTitle',
          id: 'someId',
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'training-summary', expectedQueryArgs);
        assert.ok(true);
      });
    });
  });
});
