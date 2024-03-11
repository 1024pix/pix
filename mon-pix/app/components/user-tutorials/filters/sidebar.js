import { A } from '@ember/array';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import sortBy from 'lodash/sortBy';

class Filters {
  @tracked competences = A([]);
}

export default class Sidebar extends Component {
  @tracked filters = new Filters();

  get sortedAreas() {
    return sortBy(this.args.areas, 'code');
  }

  @action
  handleFilterChange(type, id) {
    if (!this.filters[type].includes(id)) {
      this.filters[type].pushObject(id);
    } else {
      this.filters[type].removeObject(id);
    }
  }

  @action
  handleResetFilters() {
    this.filters = new Filters();
  }
}
