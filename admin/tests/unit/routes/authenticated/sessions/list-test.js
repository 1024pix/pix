import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/list', function(hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function() {
    route = this.owner.lookup('route:authenticated/sessions/list');
  });

  module('#model', function(hooks) {
    let params;
    const expectedQueryArgs = {};

    hooks.beforeEach(function() {
      route.store.query = sinon.stub();
      params = {};
      params.pageNumber = 'somePageNumber';
      params.pageSize = 'somePageSize';
      expectedQueryArgs.page = {
        number: 'somePageNumber',
        size: 'somePageSize',
      };
    });

    module('when queryParams are undefined', function() {

      test('it should call store.query with no filters', async function(assert) {
        // when
        await route.model(params);
        expectedQueryArgs.filter = {
          id: undefined,
          certificationCenterName: undefined,
          status: undefined,
          resultsSentToPrescriberAt: undefined,
        };

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams id is truthy', function() {

      test('it should call store.query with a filter with trimmed id', async function(assert) {
        // given
        params.id = ' someId';
        expectedQueryArgs.filter = {
          id: 'someId',
          certificationCenterName: undefined,
          status: undefined,
          resultsSentToPrescriberAt: undefined,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams certificationCenterName is truthy', function() {

      test('it should call store.query with a filter with trimmed certificationCenterName', async function(assert) {
        // given
        params.certificationCenterName = ' someName';
        expectedQueryArgs.filter = {
          id: undefined,
          certificationCenterName: 'someName',
          status: undefined,
          resultsSentToPrescriberAt: undefined,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams status is truthy', function() {

      test('it should call store.query with a filter with trimmed status', async function(assert) {
        // given
        params.status = ' someStatus';
        expectedQueryArgs.filter = {
          id: undefined,
          certificationCenterName: undefined,
          status: 'someStatus',
          resultsSentToPrescriberAt: undefined,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams resultsSentToPrescriberAt is truthy', function() {

      test('it should call store.query with a filter with trimmed resultsSentToPrescriberAt', async function(assert) {
        // given
        params.resultsSentToPrescriberAt = ' someValue';
        expectedQueryArgs.filter = {
          id: undefined,
          certificationCenterName: undefined,
          status: undefined,
          resultsSentToPrescriberAt: 'someValue',
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when query to the store throws an error', function() {
      test('it should return an empty array of sessions', async function(assert) {
        // given
        route.store.query.rejects();

        // when
        const returnedSessions = await route.model({});

        // then
        assert.deepEqual(returnedSessions, []);
      });
    });

    module('when query to the store is successful', function() {
      test('it should return the result of the store call to query', async function(assert) {
        // given
        route.store.query.resolves('someSessions');

        // when
        const returnedSessions = await route.model({});

        // then
        assert.equal(returnedSessions, 'someSessions');
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
        certificationCenterName: 'someName',
        status: 'someStatus',
        resultsSentToPrescriberAt: 'someValue',
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
        assert.equal(controller.certificationCenterName, null);
        assert.equal(controller.status, 'finalized');
        assert.equal(controller.resultsSentToPrescriberAt, null);
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
        assert.equal(controller.certificationCenterName, 'someName');
        assert.equal(controller.status, 'someStatus');
        assert.equal(controller.resultsSentToPrescriberAt, 'someValue');
      });
    });

  });
});
