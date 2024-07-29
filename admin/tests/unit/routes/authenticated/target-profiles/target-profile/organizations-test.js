import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/target-profiles/target-profile/organizations', function (hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/target-profiles/target-profile/organizations');
  });

  module('#resetController', function (hooks) {
    let controller;

    hooks.beforeEach(function () {
      controller = {
        pageNumber: 'somePageNumber',
        pageSize: 'somePageSize',
        name: 'someName',
        type: 'someType',
        externalId: 'someExternalId',
      };
    });

    module('when route is exiting', function () {
      test('it should reset controller', function (assert) {
        // when
        route.resetController(controller, true);

        // then
        assert.deepEqual(controller.pageNumber, 1);
        assert.deepEqual(controller.pageSize, 10);
        assert.deepEqual(controller.name, null);
        assert.deepEqual(controller.type, null);
        assert.deepEqual(controller.externalId, null);
      });
    });

    module('when route is not exiting', function () {
      test('it should not reset controller', function (assert) {
        // when
        route.resetController(controller, false);

        // then
        assert.deepEqual(controller.pageNumber, 'somePageNumber');
        assert.deepEqual(controller.pageSize, 'somePageSize');
        assert.deepEqual(controller.name, 'someName');
        assert.deepEqual(controller.type, 'someType');
        assert.deepEqual(controller.externalId, 'someExternalId');
      });
    });
  });

  module('#model', function () {
    module('when an error occurs', function () {
      test('returns an empty array', async function (assert) {
        // given
        const params = {};
        route.modelFor = sinon.stub().returns({ id: '123' });
        route.store.query = sinon.stub().rejects();

        // when
        const model = await route.model(params);

        // then
        assert.deepEqual(model.organizations, []);
      });
    });
  });
});
