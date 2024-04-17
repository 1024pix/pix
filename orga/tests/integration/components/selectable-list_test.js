import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | Selectable List', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When user toggle one of the checkbox', function () {
    test('should toggle the main checkbox', async function (assert) {
      // given
      const items = [
        { id: 1, label: 'Item 1' },
        { id: 2, label: 'Item 2' },
      ];
      this.set('items', items);

      const screen = await render(hbs`<SelectableList @items={{this.items}}>
  <:manager as |allSelected someSelected|>
    <PixCheckbox @checked={{someSelected}} @isIndeterminate={{not allSelected}}>
      <:label>Main checkbox</:label>
    </PixCheckbox>
  </:manager>
  <:item as |checkboxItem toggleCheckboxItem isSelected|>
    <PixCheckbox @id={{checkboxItem.id}} @checked={{isSelected}} {{on 'click' toggleCheckboxItem}}>
      <:label>{{checkboxItem.label}}</:label>
    </PixCheckbox>
  </:item>
</SelectableList>`);

      // when
      await click(screen.getByLabelText('Item 2'));

      // then
      const mainCheckbox = screen.getByLabelText('Main checkbox');
      assert.true(mainCheckbox.checked);
      assert.ok(mainCheckbox.className.includes('pix-checkbox__input--indeterminate'));
    });
  });
});
