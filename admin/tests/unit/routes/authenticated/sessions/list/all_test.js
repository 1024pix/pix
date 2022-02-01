import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
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
          resultsSentToPrescriberAt: undefined,
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
          resultsSentToPrescriberAt: undefined,
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
          resultsSentToPrescriberAt: undefined,
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
          resultsSentToPrescriberAt: undefined,
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
          resultsSentToPrescriberAt: undefined,
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
          resultsSentToPrescriberAt: undefined,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams resultsSentToPrescriberAt is true', function () {
      test('it should call store.query with a filter with true resultsSentToPrescriberAt', async function (assert) {
        // given
        params.resultsSentToPrescriberAt = true;
        expectedQueryArgs.filter = {
          id: undefined,
          certificationCenterName: undefined,
          certificationCenterType: undefined,
          certificationCenterExternalId: undefined,
          status: undefined,
          resultsSentToPrescriberAt: true,
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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(returnedSessions, 'someSessions');
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
        resultsSentToPrescriberAt: 'someValue',
      };
    });

    module('when route is exiting', function () {
      test('it should reset controller', function (assert) {
        // when
        route.resetController(controller, true);

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.pageNumber, 1);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.pageSize, 10);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.id, null);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.certificationCenterName, null);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.certificationCenterType, null);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.status, 'finalized');
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.resultsSentToPrescriberAt, null);
      });
    });

    module('when route is not exiting', function () {
      test('it should not reset controller', function (assert) {
        // when
        route.resetController(controller, false);

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.pageNumber, 'somePageNumber');
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.pageSize, 'somePageSize');
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.id, 'someId');
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.certificationCenterName, 'someName');
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.status, 'someStatus');
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.certificationCenterType, 'someType');
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.resultsSentToPrescriberAt, 'someValue');
      });
    });
  });
});
