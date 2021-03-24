import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/target-profiles/list', (hooks) => {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function() {
    route = this.owner.lookup('route:authenticated/target-profiles/list');
  });

  module('#model', (hooks) => {
    const params = {};
    const expectedQueryArgs = {};

    hooks.beforeEach(() => {
      route.store.query = sinon.stub().resolves();
      params.pageNumber = 'somePageNumber';
      params.pageSize = 'somePageSize';
      expectedQueryArgs.page = {
        number: 'somePageNumber',
        size: 'somePageSize',
      };
    });

    module('when queryParams filters are falsy', () => {

      test('it should call store.query with no filters on name and id', async function(assert) {
        // when
        await route.model(params);
        expectedQueryArgs.filter = {
          name: '',
          id: '',
        };

        // then
        sinon.assert.calledWith(route.store.query, 'target-profile', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams filters are truthy', () => {

      test('it should call store.query with filters containing trimmed values', async function(assert) {
        // given
        params.name = ' someName';
        params.id = 'someId ';
        expectedQueryArgs.filter = {
          name: 'someName',
          id: 'someId',
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'target-profile', expectedQueryArgs);
        assert.ok(true);
      });
    });

  });

  module('#resetController', (hooks) => {
    let controller;

    hooks.beforeEach(() => {
      controller = {
        pageNumber: 'somePageNumber',
        pageSize: 'somePageSize',
        name: 'someName',
        id: 'someId',
      };
    });

    module('when route is exiting', () => {

      test('it should reset controller', function(assert) {
        // when
        route.resetController(controller, true);

        // then
        assert.equal(controller.pageNumber, 1);
        assert.equal(controller.pageSize, 10);
        assert.equal(controller.name, null);
        assert.equal(controller.id, null);
      });
    });

    module('when route is not exiting', () => {

      test('it should not reset controller', function(assert) {
        // when
        route.resetController(controller, false);

        // then
        assert.equal(controller.pageNumber, 'somePageNumber');
        assert.equal(controller.pageSize, 'somePageSize');
        assert.equal(controller.name, 'someName');
        assert.equal(controller.id, 'someId');
      });
    });
  });
});
