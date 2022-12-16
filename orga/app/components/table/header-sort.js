import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class HeaderSort extends Component {
  @tracked order = this.args.defaultOrder || 'desc';

  @action
  toggleSort() {
    if (this.order === 'desc') {
      this.order = 'asc';
    } else {
      this.order = 'desc';
    }
    this.args.onSort(this.order);
  }
}
