import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Unit | Controller | authenticated/catalogue/list', function (hooks) {
  setupIntlRenderingTest(hooks);
  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/catalogue/list');
  });

  module('#isFiltered', function () {
    test('it should be false if no filter is filled', async function (assert) {
      // given
      controller.search = '';
      controller.category = '';
      controller.areas = [];
      controller.competences = [];

      // then
      assert.false(controller.isFiltered);
    });
    test('it should be true if search filter is filled', async function (assert) {
      // given
      controller.search = 'Parcours';
      controller.category = '';
      controller.areas = [];
      controller.competences = [];

      // then
      assert.true(controller.isFiltered);
    });
    test('it should be true if category filter is filled', async function (assert) {
      // given
      controller.search = '';
      controller.category = 'Category';
      controller.areas = [];
      controller.competences = [];

      // then
      assert.true(controller.isFiltered);
    });
    test('it should be true if areas filter is filled', async function (assert) {
      // given
      controller.search = '';
      controller.category = '';
      controller.areas = ['Area1', 'Area2'];
      controller.competences = [];

      // then
      assert.true(controller.isFiltered);
    });
    test('it should be true if competences filter is filled', async function (assert) {
      // given
      controller.search = '';
      controller.category = '';
      controller.areas = [];
      controller.competences = ['Competence1', 'Competence2'];

      // then
      assert.true(controller.isFiltered);
    });
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
