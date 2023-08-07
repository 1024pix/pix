import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class AttachTargetProfile extends Component {
  get debounce() {
    return 0;
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
