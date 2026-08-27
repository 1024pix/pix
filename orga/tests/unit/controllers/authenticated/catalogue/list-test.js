import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Unit | Controller | authenticated/catalogue/list', function (hooks) {
  setupIntlRenderingTest(hooks);
  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/catalogue/list');
  });

  module('#updateFilter', function () {
    test('it should update controller field (search as example)', async function (assert) {
      // given
      controller.search = '';
      const expectedValue = 'Parcours';

      // when
      await controller.updateFilter('search', expectedValue);

      // then
      assert.strictEqual(controller.search, expectedValue);
    });
  });

  module('#resetFilters', function () {
    test('it should reset defined filters', async function (assert) {
      // given
      controller.search = 'Parcours';
      controller.category = 'Category';
      controller.areas = ['Area1', 'Area2'];
      controller.competences = ['Competence1', 'Competence2'];

      // when
      await controller.resetFilters();

      // then
      assert.strictEqual(controller.search, '');
      assert.strictEqual(controller.category, '');
      assert.deepEqual(controller.areas, []);
      assert.deepEqual(controller.competences, []);
    });
  });
});
