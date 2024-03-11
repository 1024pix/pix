import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class SelectFilter extends Component {
  @action
  onChange(value) {
    const { triggerFiltering, field } = this.args;
    triggerFiltering(field, value);
  }
}
