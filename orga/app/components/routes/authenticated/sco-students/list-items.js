import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ListItems extends Component {

  @service currentUser;

  @tracked student = null;
  @tracked isShowingModal = false;
  @tracked isShowingDissociateModal = false;

  @action
  openPasswordReset(student) {
    this.student = student;
    this.isShowingModal = true;
  }

  @action
  closePasswordReset() {
    this.isShowingModal = false;
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
