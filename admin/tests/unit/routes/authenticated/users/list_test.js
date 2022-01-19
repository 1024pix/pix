import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
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
          firstName: '',
          lastName: '',
          email: '',
        };

        // then
        sinon.assert.notCalled(route.store.query);
        assert.ok(true);
      });
    });

    module('when queryParams filters are  truthy', function () {
      test('it should call store.query with filters containing trimmed values', async function (assert) {
        // given
        params.firstName = ' someFirstName';
        params.lastName = 'someLastName ';
        params.email = 'someEmail';
        expectedQueryArgs.filter = {
          firstName: 'someFirstName',
          lastName: 'someLastName',
          email: 'someEmail',
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'user', expectedQueryArgs);
        assert.ok(true);
      });
    });
  });

  module('#resetController', function (hooks) {
    let controller;

    hooks.beforeEach(function () {
      controller = {
        pageNumber: 'somePageNumber',
        pageSize: 'somePageSize',
        firstName: 'someFirstName',
        lastName: 'someLastName',
        email: 'someEmail',
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
        assert.equal(controller.firstName, null);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.lastName, null);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.email, null);
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
        assert.equal(controller.firstName, 'someFirstName');
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.lastName, 'someLastName');
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(controller.email, 'someEmail');
      });
    });
  });
});
