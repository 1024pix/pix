import Component from '@glimmer/component';
import { action } from '@ember/object';
import ENV from 'pix-admin/config/environment';

export default class SearchBar extends Component {
  get debounce() {
    return ENV.searchTargetProfiles.debounce;
  }

  @action
  async onSearchValueInput(_, value) {
    this.args.onSearch(value);
  }

  @action
  onSelectTargetProfile(option) {
    this.args.onSelection(option);
  }
}
