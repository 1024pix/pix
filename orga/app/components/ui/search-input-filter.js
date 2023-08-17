import { action } from '@ember/object';
import Component from '@glimmer/component';
import debounce from 'lodash/debounce';
import ENV from 'pix-orga/config/environment';

export default class SearchInputFilter extends Component {
  constructor() {
    super(...arguments);
    this.debouncedTriggerFiltering = debounce(this.args.triggerFiltering, ENV.pagination.debounce);
  }

  @action
  onSearch(event) {
    this.debouncedTriggerFiltering(this.args.field, event.target.value);
  }
}
