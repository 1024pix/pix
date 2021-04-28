import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/organizations/list', function(hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function() {
    route = this.owner.lookup('route:authenticated/organizations/list');
  });

  module('#model', function(hooks) {
    const params = {};
    const expectedQueryArgs = {};

    hooks.beforeEach(function() {
      route.store.query = sinon.stub().resolves();
      params.pageNumber = 'somePageNumber';
      params.pageSize = 'somePageSize';
      expectedQueryArgs.page = {
        number: 'somePageNumber',
        size: 'somePageSize',
      };
    });

    module('when queryParams filters are falsy', function() {

      test('it should call store.query with no filters on id, name, type and externalId', async function(assert) {
        // when
        await route.model(params);
        expectedQueryArgs.filter = {
          id: '',
          name: '',
          type: '',
          externalId: '',
        };

        // then
        sinon.assert.calledWith(route.store.query, 'organization', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams filters are  truthy', function() {

      test('it should call store.query with filters containing trimmed values', async function(assert) {
        // given
        params.id = ' someId';
        params.name = ' someName';
        params.type = 'someType ';
        params.externalId = 'someExternalId';
        expectedQueryArgs.filter = {
          id: 'someId',
          name: 'someName',
          type: 'someType',
          externalId: 'someExternalId',
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'organization', expectedQueryArgs);
        assert.ok(true);
      });
    });

  });

  module('#resetController', function(hooks) {
    let controller;

    hooks.beforeEach(function() {
      controller = {
        pageNumber: 'somePageNumber',
        pageSize: 'somePageSize',
        id: 'someId',
        name: 'someName',
        type: 'someType',
        externalId: 'someExternalId',
      };
    });

    module('when route is exiting', function() {

      test('it should reset controller', function(assert) {
        // when
        route.resetController(controller, true);

        // then
        assert.equal(controller.pageNumber, 1);
        assert.equal(controller.pageSize, 10);
        assert.equal(controller.id, null);
        assert.equal(controller.name, null);
        assert.equal(controller.type, null);
        assert.equal(controller.externalId, null);
      });
    });

    module('when route is not exiting', function() {

      test('it should not reset controller', function(assert) {
        // when
        route.resetController(controller, false);

        // then
        assert.equal(controller.pageNumber, 'somePageNumber');
        assert.equal(controller.pageSize, 'somePageSize');
        assert.equal(controller.id, 'someId');
        assert.equal(controller.name, 'someName');
        assert.equal(controller.type, 'someType');
        assert.equal(controller.externalId, 'someExternalId');
      });
    });

  });
});
