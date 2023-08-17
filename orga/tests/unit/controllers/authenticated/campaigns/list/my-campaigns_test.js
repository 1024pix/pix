import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Unit | Controller | authenticated/campaigns/list/all-campaigns', function (hooks) {
  setupIntlRenderingTest(hooks);
  let controller;
  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/campaigns/list/my-campaigns');
  });

  module('#action clearFilters', function () {
    test('it should set params to initial empty values', async function (assert) {
      // given
      controller.status = 'archived';
      controller.name = 'a name';
      controller.pageNumber = 4;

      // when
      await controller.clearFilters();

      // then
      assert.strictEqual(controller.status, null);
      assert.strictEqual(controller.name, null);
      assert.strictEqual(controller.pageNumber, null);
    });
  });

  module('#triggerFiltering', function () {
    module('when the filters contain a valued field', function () {
      test('updates the value', async function (assert) {
        // given
        controller.someField = 'old-value';

        // when
        controller.triggerFiltering('someField', 'new-value');

        // then
        assert.strictEqual(controller.someField, 'new-value');
      });
    });

    module('when the filters contain an empty string', function () {
      test('clear the searched value', async function (assert) {
        // given
        controller.someField = 'old-value';

        // when
        controller.triggerFiltering('someField', '');

        // then
        assert.strictEqual(controller.someField, undefined);
      });
    });
  });
});
