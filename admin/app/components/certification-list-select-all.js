import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class CertificationListSelectAll extends Component {

  @action
  onToggleAllSelection() {
    this.toggleAllSelection();
  }
}
