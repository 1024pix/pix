import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class CertificationSelect extends Component {
  @action
  onChange() {
    this.select(this.id);
  }
}
