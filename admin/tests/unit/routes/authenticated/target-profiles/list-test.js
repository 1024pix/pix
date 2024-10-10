import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/target-profiles/list', function (hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/target-profiles/list');
  });

  module('#model', function (hooks) {
    const params = {};
    const expectedQueryArgs = {};
    let queryStub;

    hooks.beforeEach(function () {
      queryStub = sinon.stub(route.store, 'query').resolves();
      params.pageNumber = 'somePageNumber';
      params.pageSize = 'somePageSize';
      expectedQueryArgs.page = {
        number: 'somePageNumber',
        size: 'somePageSize',
      };
    });

    hooks.afterEach(function () {
      sinon.restore();
    });

    module('when queryParams filters are falsy', function () {
      test('it should call store.query with no filters on name and id', async function (assert) {
        // when
        await route.model(params);
        expectedQueryArgs.filter = {
          name: '',
          id: '',
          categories: [],
        };

        // then
        sinon.assert.calledWith(route.store.query, 'target-profile-summary', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams filters are truthy', function () {
      test('it should call store.query with filters containing trimmed values', async function (assert) {
        // given
        params.name = ' someName';
        params.id = 'someId ';
        params.categories = ['OTHER'];
        expectedQueryArgs.filter = {
          name: 'someName',
          id: 'someId',
          categories: ['OTHER'],
        };

        // when
        await route.model(params);

        // then
        assert.ok(queryStub.calledWith('target-profile-summary', expectedQueryArgs));
      });
    });
  });

  module('#resetController', function (hooks) {
    let controller;

    hooks.beforeEach(function () {
      controller = {
        pageNumber: 'somePageNumber',
        pageSize: 'somePageSize',
        name: 'someName',
        id: 'someId',
        categories: ['OTHER'],
      };
    });

    module('when route is exiting', function () {
      test('it should reset controller', function (assert) {
        // when
        route.resetController(controller, true);

        // then
        assert.strictEqual(controller.pageNumber, 1);
        assert.strictEqual(controller.pageSize, 10);
        assert.strictEqual(controller.name, null);
        assert.strictEqual(controller.id, null);
        assert.strictEqual(controller.categories.length, 0);
      });
    });

    module('when route is not exiting', function () {
      test('it should not reset controller', function (assert) {
        // when
        route.resetController(controller, false);

        // then
        assert.strictEqual(controller.pageNumber, 'somePageNumber');
        assert.strictEqual(controller.pageSize, 'somePageSize');
        assert.strictEqual(controller.name, 'someName');
        assert.strictEqual(controller.id, 'someId');
        assert.deepEqual(controller.categories, ['OTHER']);
      });
    });
  });

  module('#beforeModel', function () {
    test('it should check if current user is "SUPER_ADMIN", "SUPPORT", or "METIER"', function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/target-profiles/list');

      const restrictAccessToStub = sinon.stub().returns();
      class AccessControlStub extends Service {
        restrictAccessTo = restrictAccessToStub;
      }
      this.owner.register('service:access-control', AccessControlStub);

      // when
      route.beforeModel();

      // then
      assert.ok(restrictAccessToStub.calledWith(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated'));
    });
  });
});
