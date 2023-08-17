import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CertificationIssueReport extends Component {
  @service notifications;
  @service accessControl;

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
