import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Controller | authenticated/target-profiles/list', function (hooks) {
  setupTest(hooks);
  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated.target-profiles.list');
  });

  module('#updateFilters', function () {
    module('resetting page number', function () {
      test('it should reset page number', async function (assert) {
        // given
        controller.pageNumber = 10;
        const expectedValue = 1;

        // when
        await controller.updateFilters({});

        // then
        assert.strictEqual(controller.pageNumber, expectedValue);
      });
    });

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

    module('updating id', function () {
      test('it should update controller id field', async function (assert) {
        // given
        controller.id = 'someId';
        const expectedValue = 'someOtherId';

        // when
        await controller.updateFilters({ id: expectedValue });

        // then
        assert.strictEqual(controller.id, expectedValue);
      });
    });

    module('updating categories', function () {
      test('it should update controller categories field', async function (assert) {
        // given
        controller.categories = ['someCategories'];
        const expectedValue = ['someOtherCategories'];

        // when
        await controller.updateFilters({ categories: expectedValue });

        // then
        assert.strictEqual(controller.categories, expectedValue);
      });
    });
  });

  module('#onResetFilter', function () {
    test('it should reset controller filter', async function (assert) {
      // given
      controller.name = 'someName';
      controller.id = 'someId';
      controller.categories = ['someCategories'];

      // when
      await controller.onResetFilter();

      // then
      assert.strictEqual(controller.name, null);
      assert.strictEqual(controller.id, null);
      assert.strictEqual(controller.categories.length, 0);
    });
  });
});
