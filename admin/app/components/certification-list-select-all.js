import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class CertificationListSelectAll extends Component {
  @action
  onToggleAllSelection() {
    this.toggleAllSelection();
  }
}
