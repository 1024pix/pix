import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class HeaderSort extends Component {
  @tracked order;
  @tracked icon;
  @tracked ariaLabel;

  constructor(...args) {
    super(...args);
    if (this.args.defaultOrder === 'desc') {
      this._setDescendantSort();
    } else if (this.args.defaultOrder === 'asc') {
      this._setAscendantSort();
    } else {
      this._setDefaultSort();
    }
  }

  @action
  toggleSort() {
    if (this.order === 'asc') {
      this._setDescendantSort();
    } else {
      this._setAscendantSort();
    }
    this.args.onSort(this.order);
  }

  _setDefaultSort() {
    this.order = null;
    this.icon = 'sort';
    this.ariaLabel = this.args.ariaLabelDefaultSort;
  }

  _setAscendantSort() {
    this.order = 'asc';
    this.icon = 'sort-up';
    this.ariaLabel = this.args.ariaLabelSortUp;
  }

  _setDescendantSort() {
    this.order = 'desc';
    this.icon = 'sort-down';
    this.ariaLabel = this.args.ariaLabelSortDown;
  }
}
