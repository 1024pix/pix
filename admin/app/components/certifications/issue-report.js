import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class CertificationIssueReport extends Component {
  @service notifications;

  @tracked showResolveModal = false;

  @action
  toggleResolveModal() {
    this.showResolveModal = !this.showResolveModal;
  }

  @action
  closeResolveModal() {
    this.showResolveModal = false;
  }
}
