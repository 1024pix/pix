import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/list/all', (hooks) => {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function() {
    route = this.owner.lookup('route:authenticated/sessions/list/all');
  });

  module('#model', (hooks) => {
    let params;
    const expectedQueryArgs = {};

    hooks.beforeEach(() => {
      route.store.query = sinon.stub();
      params = {};
      params.pageNumber = 'somePageNumber';
      params.pageSize = 'somePageSize';
      expectedQueryArgs.page = {
        number: 'somePageNumber',
        size: 'somePageSize',
      };
    });

    module('when queryParams are undefined', () => {

      test('it should call store.query with no filters', async function(assert) {
        // when
        await route.model(params);
        expectedQueryArgs.filter = {
          id: undefined,
          certificationCenterName: undefined,
          certificationCenterType: undefined,
          status: undefined,
          resultsSentToPrescriberAt: undefined,
          assignedToSelfOnly: undefined,
        };

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams id is truthy', () => {

      test('it should call store.query with a filter with trimmed id', async function(assert) {
        // given
        params.id = ' someId';
        expectedQueryArgs.filter = {
          id: 'someId',
          certificationCenterName: undefined,
          certificationCenterType: undefined,
          status: undefined,
          resultsSentToPrescriberAt: undefined,
          assignedToSelfOnly: undefined,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams certificationCenterName is truthy', () => {

      test('it should call store.query with a filter with trimmed certificationCenterName', async function(assert) {
        // given
        params.certificationCenterName = ' someName';
        expectedQueryArgs.filter = {
          id: undefined,
          certificationCenterName: 'someName',
          certificationCenterType: undefined,
          status: undefined,
          resultsSentToPrescriberAt: undefined,
          assignedToSelfOnly: undefined,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams certificationCenterType is truthy', () => {

      test('it should call store.query with a filter with trimmed certificationCenterType', async function(assert) {
        // given
        params.certificationCenterType = 'SCO';
        expectedQueryArgs.filter = {
          id: undefined,
          certificationCenterName: undefined,
          certificationCenterType: 'SCO',
          status: undefined,
          resultsSentToPrescriberAt: undefined,
          assignedToSelfOnly: undefined,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams status is truthy', () => {

      test('it should call store.query with a filter with status', async function(assert) {
        // given
        params.status = 'someStatus';
        expectedQueryArgs.filter = {
          id: undefined,
          certificationCenterName: undefined,
          certificationCenterType: undefined,
          status: 'someStatus',
          resultsSentToPrescriberAt: undefined,
          assignedToSelfOnly: undefined,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams resultsSentToPrescriberAt is true', () => {

      test('it should call store.query with a filter with true resultsSentToPrescriberAt', async function(assert) {
        // given
        params.resultsSentToPrescriberAt = true;
        expectedQueryArgs.filter = {
          id: undefined,
          certificationCenterName: undefined,
          certificationCenterType: undefined,
          status: undefined,
          resultsSentToPrescriberAt: true,
          assignedToSelfOnly: undefined,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams assignedToSelfOnly is truthy', () => {

      test('it should call store.query with a filter with assignedToSelfOnly', async function(assert) {
        // given
        params.assignedToSelfOnly = true;
        expectedQueryArgs.filter = {
          id: undefined,
          certificationCenterName: undefined,
          certificationCenterType: undefined,
          status: undefined,
          resultsSentToPrescriberAt: undefined,
          assignedToSelfOnly: true,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'session', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when query to the store throws an error', () => {
      test('it should return an empty array of sessions', async function(assert) {
        // given
        route.store.query.rejects();

        // when
        const returnedSessions = await route.model({});

        // then
        assert.deepEqual(returnedSessions, []);
      });
    });

    module('when query to the store is successful', () => {
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

  module('#resetController', (hooks) => {
    let controller;

    hooks.beforeEach(() => {
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

    module('when route is exiting', () => {

      test('it should reset controller', function(assert) {
        // when
        route.resetController(controller, true);

        // then
        assert.equal(controller.pageNumber, 1);
        assert.equal(controller.pageSize, 10);
        assert.equal(controller.id, null);
        assert.equal(controller.certificationCenterName, null);
        assert.equal(controller.certificationCenterType, null);
        assert.equal(controller.status, 'finalized');
        assert.equal(controller.resultsSentToPrescriberAt, null);
      });
    });

    module('when route is not exiting', () => {

      test('it should not reset controller', function(assert) {
        // when
        route.resetController(controller, false);

        // then
        assert.equal(controller.pageNumber, 'somePageNumber');
        assert.equal(controller.pageSize, 'somePageSize');
        assert.equal(controller.id, 'someId');
        assert.equal(controller.certificationCenterName, 'someName');
        assert.equal(controller.status, 'someStatus');
        assert.equal(controller.certificationCenterType, 'someType');
        assert.equal(controller.resultsSentToPrescriberAt, 'someValue');
      });
    });
  });
});
