import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class HeaderSort extends Component {
  get classname() {
    const className = ['table__column--sort'];
    if (this.args.display === 'left') {
      className.push('table__column--sort-no-center');
    }
    return className.join(' ');
  }

  get icon() {
    if (!this.args.order) {
      return 'sort';
    }
    return this.args.order === 'asc' ? 'sort-up' : 'sort-down';
  }

  get ariaLabel() {
    if (!this.args.order) {
      return this.args.ariaLabelDefaultSort;
    }
    return this.args.order === 'asc' ? this.args.ariaLabelSortUp : this.args.ariaLabelSortDown;
  }

  @action
  toggleSort() {
    if (this.args.order === 'asc') {
      this.args.onSort('desc');
    } else {
      this.args.onSort('asc');
    }
  }
}
