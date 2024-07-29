import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | Selectable List', function (hooks) {
  setupTest(hooks);

  module('#reset', function () {
    test('should clear list of selected elements', async function (assert) {
      // given
      const firstItem = { id: 1 };
      const secondItem = { id: 2 };
      const items = [firstItem, secondItem];
      const component = await createGlimmerComponent('component:selectable-list', {
        items,
      });
      component.selectedItems = items;

      // when
      component.reset();

      // then
      assert.strictEqual(component.selectedItems.length, 0);
    });
  });

  module('#allSelected', function () {
    test('should return false if not all element have been selected', async function (assert) {
      // given
      const firstItem = { id: 1 };
      const secondItem = { id: 2 };
      const items = [firstItem, secondItem];
      const component = await createGlimmerComponent('component:selectable-list', {
        items,
      });

      // when
      const result = component.allSelected;

      // then
      assert.false(result);
    });

    test('should return true if all element have been selected', async function (assert) {
      // given
      const firstItem = { id: 1 };
      const secondItem = { id: 2 };
      const items = [firstItem, secondItem];
      const component = await createGlimmerComponent('component:selectable-list', {
        items,
      });

      // when
      component.selectedItems = items;
      const result = component.allSelected;

      // then
      assert.true(result);
    });
  });

  module('#someSelected', function () {
    test('should return true when selected elements count is greater than 1', async function (assert) {
      // given
      const firstItem = { id: 1 };
      const secondItem = { id: 2 };
      const items = [firstItem, secondItem];
      const component = await createGlimmerComponent('component:selectable-list', {
        items,
      });

      // when
      component.selectedItems.push(firstItem);
      const result = component.someSelected;

      // then
      assert.true(result);
    });

    test('should return false when selected elements count is lesser than 1', async function (assert) {
      // given
      const firstItem = { id: 1 };
      const secondItem = { id: 2 };
      const items = [firstItem, secondItem];
      const component = await createGlimmerComponent('component:selectable-list', {
        items,
      });

      // when
      const result = component.someSelected;

      // then
      assert.false(result);
    });
  });

  module('#toggle', function () {
    test('should add an element in selected list', async function (assert) {
      // given
      const selectedItem = {};
      const notSelectedItem = {};
      const items = [selectedItem, notSelectedItem];
      const component = await createGlimmerComponent('component:selectable-list', {
        items,
      });

      // when
      component.toggle(selectedItem);

      // then
      assert.true(component.selectedItems.includes(selectedItem));
      assert.false(component.selectedItems.includes(notSelectedItem));
    });

    test('should remove a selected element from the selected list', async function (assert) {
      // given
      const selectedItem = {};
      const notSelectedItem = {};
      const items = [selectedItem, notSelectedItem];
      const component = await createGlimmerComponent('component:selectable-list', {
        items,
      });
      component.selectedItems.push(selectedItem);
      component.selectedItems.push(notSelectedItem);

      // when
      component.toggle(notSelectedItem);

      // then
      assert.false(component.selectedItems.includes(notSelectedItem));
      assert.true(component.selectedItems.includes(selectedItem));
    });
  });

  module('#toggleAll', function () {
    module('when selected list is empty', function () {
      test('should add all elements in selected list', async function (assert) {
        const firstItem = { id: 1 };
        const lastItem = { id: 2 };

        const items = [firstItem, lastItem];
        const component = await createGlimmerComponent('component:selectable-list', { items });

        // when
        component.toggleAll();

        // then
        assert.deepEqual(component.selectedItems, items);
      });
    });

    module('when all elements are in selected list', function () {
      test('should unselect all elements when all are already selected', async function (assert) {
        const firstItem = { id: 1 };
        const lastItem = { id: 2 };

        const items = [firstItem, lastItem];
        const component = await createGlimmerComponent('component:selectable-list', { items });
        component.selectedItems.push(firstItem);
        component.selectedItems.push(lastItem);

        // when
        component.toggleAll();

        // then
        assert.deepEqual(component.selectedItems, []);
      });
    });

    module('when some elements are in selected list', function () {
      test('should unselect all elements when all are already selected', async function (assert) {
        const firstItem = { id: 1 };
        const secondItem = { id: 2 };
        const lastItem = { id: 3 };
        const items = [firstItem, secondItem, lastItem];

        const component = await createGlimmerComponent('component:selectable-list', { items });

        component.selectedItems.push(firstItem);
        component.selectedItems.push(secondItem);

        // when
        component.toggleAll();

        // then
        assert.deepEqual(component.selectedItems, []);
      });
    });
  });

  module('#isSelected', function () {
    test('should return true if item is in selected list', async function (assert) {
      // given
      const item = {};
      const component = await createGlimmerComponent('component:selectable-list', { items: [item] });
      component.selectedItems.push(item);

      // when
      const isMyItemSelected = component.isSelected(item);

      // then
      assert.true(isMyItemSelected);
    });

    test('should return false if item is not in selected list', async function (assert) {
      // given
      const item = {};
      const component = await createGlimmerComponent('component:selectable-list', { items: [item] });

      // when
      const isMyItemSelected = component.isSelected(item);

      // then
      assert.false(isMyItemSelected);
    });
  });
});
