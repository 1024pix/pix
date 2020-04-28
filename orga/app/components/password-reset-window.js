import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default class PasswordResetWindow extends Component {

  @service store;
  @service notifications;

  isUniquePasswordVisible = false;

  generatedPassword = null;

  @action
  async resetPassword(event) {
    event.preventDefault();
    const schoolingRegistrationDependentUser = this.store.createRecord('schooling-registration-dependent-user', {
      organizationId: this.student.organization.get('id'),
      schoolingRegistrationId: this.student.id
    });

    try {
      await schoolingRegistrationDependentUser.save();
      this.generatedPassword = schoolingRegistrationDependentUser.generatedPassword;
      this.toggleProperty('isUniquePasswordVisible');
    } catch (e) {
      this.notifications.sendError('Quelque chose s\'est mal passé. Veuillez réessayer.');
    }
  }

  @action
  closePasswordReset() {
    this.set('isShowingModal', false);
  }
}
