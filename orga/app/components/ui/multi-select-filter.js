import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class MultiSelectFilter extends Component {
  @action
  onSelect(value) {
    const { onSelect, field } = this.args;
    onSelect(field, value);
  }
}
