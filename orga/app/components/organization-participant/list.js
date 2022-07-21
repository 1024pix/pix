import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class List extends Component {
  @action
  onSearch(field, value) {
    this.args.triggerFiltering({ [field]: value });
  }
}
