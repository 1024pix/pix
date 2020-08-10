import get from 'lodash/get';
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

  @action
  async generateUsernameWithTemporaryPassword(student) {
    const schoolingRegistrationDependentUser = this.store.createRecord('schooling-registration-dependent-user', {
      organizationId: this.currentUser.organization.id,
      schoolingRegistrationId: student.id
    });

    try {
      await schoolingRegistrationDependentUser.save({ adapterOptions: { generateUsernameAndTemporaryPassword: true } });
      this.username = schoolingRegistrationDependentUser.username;
      this.generatedPassword = schoolingRegistrationDependentUser.generatedPassword;
      this.args.refreshModel();
    } catch (response) {
      const errorDetail = get(response, 'errors[0].detail', 'Une erreur est survenue, veuillez réessayer ultérieurement.');
      this.notifications.sendError(errorDetail);
    }
  }

}
