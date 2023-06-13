import { module, test } from 'qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';
import { setupTest } from 'ember-qunit';

module('Unit | Component | Selectable List', function (hooks) {
  setupTest(hooks);

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
