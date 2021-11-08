import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class HeaderFilterMultiSelect extends Component {
  @action
  onSelect(value) {
    const { onSelect, field } = this.args;
    onSelect(field, value);
  }
}
