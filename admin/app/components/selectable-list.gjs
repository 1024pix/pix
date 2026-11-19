import { fn } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class SelectableList extends Component {
  @tracked selectedItems = [];

  get allSelected() {
    return this.selectedItems.length === this.args.items.length;
  }

  get someSelected() {
    return this.selectedItems.length >= 1;
  }

  @action
  toggleAll() {
    if (this.someSelected || this.allSelected) {
      this.selectedItems = [];
    } else {
      this.selectedItems = this.args.items.slice();
    }
  }

  @action
  reset() {
    this.selectedItems = [];
  }

  @action
  toggle(item) {
    if (this.isSelected(item)) {
      this.selectedItems = this.selectedItems.filter((selectedItem) => {
        return selectedItem !== item;
      });
    } else {
      this.selectedItems = [...this.selectedItems, item];
    }
  }

  @action
  isSelected(item) {
    return this.selectedItems.includes(item);
  }

  <template>
    {{#each @items as |item index|}}
      {{yield item (fn this.toggle item) (this.isSelected item) index to="item"}}
    {{/each}}
    {{yield this.allSelected this.someSelected this.toggleAll this.selectedItems this.reset to="manager"}}

    {{yield
      this.toggle
      this.isSelected
      this.allSelected
      this.someSelected
      this.toggleAll
      this.selectedItems
      this.reset
    }}
  </template>
}
