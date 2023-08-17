import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/list/all', function (hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/sessions/list/all');
  });

  module('#model', function (hooks) {
    let params;
    const expectedQueryArgs = {};

    hooks.beforeEach(function () {
      route.store.query = sinon.stub();
      params = {};
      params.pageNumber = 'somePageNumber';
      params.pageSize = 'somePageSize';
      expectedQueryArgs.page = {
        number: 'somePageNumber',
        size: 'somePageSize',
      };
    });

    module('when queryParams are undefined', function () {
      test('it should call store.query with no filters', async function (assert) {
        // when
        await route.model(params);
        expectedQueryArgs.filter = {
          id: undefined,
          certificationCenterName: undefined,
          certificationCenterType: undefined,
          certificationCenterExternalId: undefined,
          status: undefined,
          version: undefined,
        };

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams id is truthy', function () {
      test('it should call store.query with a filter with trimmed id', async function (assert) {
        // given
        params.id = ' someId';
        expectedQueryArgs.filter = {
          id: 'someId',
          certificationCenterName: undefined,
          certificationCenterType: undefined,
          certificationCenterExternalId: undefined,
          status: undefined,
          version: undefined,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams certificationCenterName is truthy', function () {
      test('it should call store.query with a filter with trimmed certificationCenterName', async function (assert) {
        // given
        params.certificationCenterName = ' someName';
        expectedQueryArgs.filter = {
          id: undefined,
          certificationCenterName: 'someName',
          certificationCenterType: undefined,
          certificationCenterExternalId: undefined,
          status: undefined,
          version: undefined,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams certificationCenterType is truthy', function () {
      test('it should call store.query with a filter with trimmed certificationCenterType', async function (assert) {
        // given
        params.certificationCenterType = 'SCO';
        expectedQueryArgs.filter = {
          id: undefined,
          certificationCenterName: undefined,
          certificationCenterType: 'SCO',
          certificationCenterExternalId: undefined,
          status: undefined,
          version: undefined,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams certificationCenterExternalId is truthy', function () {
      test('it should call store.query with a filter with trimmed certificationCenterExternalId', async function (assert) {
        // given
        params.certificationCenterExternalId = 'EXTID';
        expectedQueryArgs.filter = {
          id: undefined,
          certificationCenterName: undefined,
          certificationCenterType: undefined,
          certificationCenterExternalId: 'EXTID',
          status: undefined,
          version: undefined,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams status is truthy', function () {
      test('it should call store.query with a filter with status', async function (assert) {
        // given
        params.status = 'someStatus';
        expectedQueryArgs.filter = {
          id: undefined,
          certificationCenterName: undefined,
          certificationCenterType: undefined,
          certificationCenterExternalId: undefined,
          status: 'someStatus',
          version: undefined,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams version is 3', function () {
      test('it should call store.query with a filter with version', async function (assert) {
        // given
        params.version = 3;
        expectedQueryArgs.filter = {
          id: undefined,
          certificationCenterName: undefined,
          certificationCenterType: undefined,
          certificationCenterExternalId: undefined,
          status: undefined,
          version: 3,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when query to the store throws an error', function () {
      test('it should return an empty array of sessions', async function (assert) {
        // given
        route.store.query.rejects();

        // when
        const returnedSessions = await route.model({});

        // then
        assert.deepEqual(returnedSessions, []);
      });
    });

    module('when query to the store is successful', function () {
      test('it should return the result of the store call to query', async function (assert) {
        // given
        route.store.query.resolves('someSessions');

        // when
        const returnedSessions = await route.model({});

        // then
        assert.deepEqual(returnedSessions, 'someSessions');
      });
    });
  });

  module('#resetController', function (hooks) {
    let controller;

    hooks.beforeEach(function () {
      controller = {
        pageNumber: 'somePageNumber',
        pageSize: 'somePageSize',
        id: 'someId',
        certificationCenterName: 'someName',
        certificationCenterType: 'someType',
        status: 'someStatus',
        version: 'someVersion',
      };
    });

    module('when route is exiting', function () {
      test('it should reset controller', function (assert) {
        // when
        route.resetController(controller, true);

        // then
        assert.deepEqual(controller.pageNumber, 1);
        assert.deepEqual(controller.pageSize, 10);
        assert.deepEqual(controller.id, null);
        assert.deepEqual(controller.certificationCenterName, null);
        assert.deepEqual(controller.certificationCenterType, null);
        assert.deepEqual(controller.status, 'finalized');
        assert.deepEqual(controller.version, null);
      });
    });

    module('when route is not exiting', function () {
      test('it should not reset controller', function (assert) {
        // when
        route.resetController(controller, false);

        // then
        assert.deepEqual(controller.pageNumber, 'somePageNumber');
        assert.deepEqual(controller.pageSize, 'somePageSize');
        assert.deepEqual(controller.id, 'someId');
        assert.deepEqual(controller.certificationCenterName, 'someName');
        assert.deepEqual(controller.status, 'someStatus');
        assert.deepEqual(controller.certificationCenterType, 'someType');
        assert.deepEqual(controller.version, 'someVersion');
      });
    });
  });
});
