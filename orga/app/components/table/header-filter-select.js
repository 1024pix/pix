import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class HeaderFilterSelect extends Component {
  @action
  onChange(event) {
    const { triggerFiltering, field } = this.args;
    triggerFiltering(field, event.target.value);
  }
}
