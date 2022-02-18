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
      controller.ownerName = 'an owner bame';

      // when
      await controller.clearFilters();

      // then
      assert.strictEqual(controller.status, null);
      assert.strictEqual(controller.name, '');
      assert.strictEqual(controller.ownerName, '');
    });
  });

  module('#get isClearFiltersButtonDisabled', function () {
    module('when status is not archived', function () {
      test('it should returns true', function (assert) {
        // given
        controller.status = null;
        controller.name = '';
        controller.ownerName = '';

        // when
        const isClearFiltersButtonDisabled = controller.isClearFiltersButtonDisabled;

        // then
        assert.true(isClearFiltersButtonDisabled);
      });
    });

    module('when filters are not empty', function () {
      test('it should returns false', function (assert) {
        // given
        controller.status = 'archived';
        controller.name = 'Some';
        controller.ownerName = '';

        // when
        const isClearFiltersButtonDisabled = controller.isClearFiltersButtonDisabled;

        // then
        assert.false(isClearFiltersButtonDisabled);
      });
    });
  });
});
