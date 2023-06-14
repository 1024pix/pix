import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

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
      this.selectedItems = [...this.args.items.toArray()];
    }
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
}
