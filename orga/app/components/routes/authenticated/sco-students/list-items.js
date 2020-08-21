import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ListItems extends Component {

  @service currentUser;
  @service store;
  @service router;
  @service notifications;

  @tracked student = null;
  @tracked isShowingAuthenticationMethodModal = false;
  @tracked isShowingDissociateModal = false;

  @action
  openAuthenticationMethodModal(student) {
    this.student = student;
    this.isShowingAuthenticationMethodModal = true;
  }

  @action
  closeAuthenticationMethodModal() {
    this.isShowingAuthenticationMethodModal = false;
  }

  @action
  openDissociateModal(student) {
    this.student = student;
    this.isShowingDissociateModal = true;
  }

  @action
  closeDissociateModal() {
    this.isShowingDissociateModal = false;
  }

}
