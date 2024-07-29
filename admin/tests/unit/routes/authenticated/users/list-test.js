import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/users/list', function (hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/users/list');
  });

  module('#model', function (hooks) {
    const params = {};
    const expectedQueryArgs = {};

    hooks.beforeEach(function () {
      // given
      route.store.query = sinon.stub().resolves();
      params.pageNumber = 'somePageNumber';
      params.pageSize = 'somePageSize';
      expectedQueryArgs.page = {
        number: 'somePageNumber',
        size: 'somePageSize',
      };
    });

    module('when queryParams filters are falsy', function () {
      test('it should not call store.query', async function (assert) {
        // when
        await route.model(params);
        expectedQueryArgs.filter = {
          id: '',
          firstName: '',
          lastName: '',
          email: '',
          username: '',
        };

        // then
        sinon.assert.notCalled(route.store.query);
        assert.ok(true);
      });
    });

    module('when queryParams filters are truthy', function () {
      test('it should call store.query with filters containing trimmed values', async function (assert) {
        // given
        params.id = ' 12 3 456 ';
        params.firstName = ' someFirstName';
        params.lastName = 'someLastName ';
        params.email = 'someEmail';
        params.username = 'someUsername';
        expectedQueryArgs.filter = {
          id: '123456',
          firstName: 'someFirstName',
          lastName: 'someLastName',
          email: 'someEmail',
          username: 'someUsername',
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'user', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when an error occurs', function () {
      test('returns an empty array', async function (assert) {
        // given
        params.id = '1';

        route.store.query = sinon.stub().rejects();
        // then
        const users = await route.model(params);

        // then
        assert.deepEqual(users, []);
      });
    });
  });

  module('#resetController', function (hooks) {
    let controller;

    hooks.beforeEach(function () {
      // given
      controller = {
        pageNumber: 'somePageNumber',
        pageSize: 'somePageSize',
        id: '123',
        firstName: 'someFirstName',
        lastName: 'someLastName',
        email: 'someEmail',
        username: 'someUsername',
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
        assert.deepEqual(controller.firstName, null);
        assert.deepEqual(controller.lastName, null);
        assert.deepEqual(controller.email, null);
        assert.deepEqual(controller.username, null);
      });
    });

    module('when route is not exiting', function () {
      test('it should not reset controller', function (assert) {
        // when
        route.resetController(controller, false);

        // then
        assert.deepEqual(controller.pageNumber, 'somePageNumber');
        assert.deepEqual(controller.pageSize, 'somePageSize');
        assert.deepEqual(controller.id, '123');
        assert.deepEqual(controller.firstName, 'someFirstName');
        assert.deepEqual(controller.lastName, 'someLastName');
        assert.deepEqual(controller.email, 'someEmail');
        assert.deepEqual(controller.username, 'someUsername');
      });
    });
  });
});
