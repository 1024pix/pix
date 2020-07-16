import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'pix-orga/config/environment';
import { tracked } from '@glimmer/tracking';

export default class ListItems extends Component {

  @service currentUser;
  @service store;
  @service router;
  @service notifications;

  @tracked student = null;
  @tracked isShowingModal = false;
  @tracked isShowingDissociateModal = false;

  isGenerateUsernameFeatureIsEnabled = ENV.APP.IS_GENERATE_USERNAME_FEATURE_ENABLED;

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
