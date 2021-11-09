import Component from '@glimmer/component';
import { action } from '@ember/object';
import ENV from 'pix-orga/config/environment';
import debounce from 'lodash/debounce';

export default class HeaderFilterInput extends Component {
  constructor() {
    super(...arguments);
    this.debouncedTriggerFiltering = debounce(this.args.triggerFiltering, ENV.pagination.debounce);
  }

  @action
  onSearch(event) {
    const { field } = this.args;
    this.debouncedTriggerFiltering(field, event.target.value);
  }
}
