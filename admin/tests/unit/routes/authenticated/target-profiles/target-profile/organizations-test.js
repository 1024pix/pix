import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | authenticated/target-profiles/target-profile/organizations', (hooks) => {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function() {
    route = this.owner.lookup('route:authenticated/target-profiles/target-profile/organizations');
  });

  module('#resetController', (hooks) => {
    let controller;

    hooks.beforeEach(() => {
      controller = {
        pageNumber: 'somePageNumber',
        pageSize: 'somePageSize',
        name: 'someName',
        type: 'someType',
        externalId: 'someExternalId',
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
        assert.equal(controller.type, null);
        assert.equal(controller.externalId, null);
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
        assert.equal(controller.type, 'someType');
        assert.equal(controller.externalId, 'someExternalId');
      });
    });

  });
});
