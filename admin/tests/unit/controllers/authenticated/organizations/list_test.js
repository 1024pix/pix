import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/organizations/list', function (hooks) {
  setupTest(hooks);
  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated.organizations.list');
  });

  module('#updateFilters', function () {
    module('updating name', function () {
      test('it should update controller name field', async function (assert) {
        // given
        controller.name = 'someName';
        const expectedValue = 'someOtherName';

        // when
        await controller.updateFilters({ name: expectedValue });

        // then
        assert.strictEqual(controller.name, expectedValue);
      });
    });

    module('updating type', function () {
      test('it should update controller type field', async function (assert) {
        // given
        controller.type = 'someType';
        const expectedValue = 'someOtherType';

        // when
        await controller.updateFilters({ type: expectedValue });

        // then
        assert.strictEqual(controller.type, expectedValue);
      });
    });

    module('updating externalId', function () {
      test('it should update controller externalId field', async function (assert) {
        // given
        controller.externalId = 'someExternalId';
        const expectedValue = 'someOtherExternalId';

        // when
        await controller.updateFilters({ externalId: expectedValue });

        // then
        assert.strictEqual(controller.externalId, expectedValue);
      });
    });
  });
});
