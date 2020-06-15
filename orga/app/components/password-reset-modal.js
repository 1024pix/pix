import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class PasswordResetModal extends Component {

  @service store;
  @service notifications;

  @tracked isUniquePasswordVisible = false;

  @tracked generatedPassword = null;

  @tracked tooltipTextUsername = 'Copier l\'identifiant';
  @tracked tooltipTextEmail = 'Copier l\'adresse e-mail';
  @tracked tooltipTextGeneratedPassword = 'Copier le mot de passe unique';

  @action
  clipboardSuccessUsername() {
    this.tooltipTextUsername = 'Copié !';
  }
  @action
  clipboardSuccessEmail() {
    this.tooltipTextEmail = 'Copié !';
  }
  @action
  clipboardSuccessGeneratedPassword() {
    this.tooltipTextGeneratedPassword = 'Copié !';
  }

  @action
  clipboardOutUsername() {
    this.tooltipTextUsername = 'Copier l\'identifiant';
  }
  @action
  clipboardOutEmail() {
    this.tooltipTextEmail = 'Copier l\'adresse e-mail';
  }
  @action
  clipboardOutGeneratedPassword() {
    this.tooltipTextGeneratedPassword = 'Copier le mot de passe unique';
  }

  @action
  async resetPassword(event) {
    event.preventDefault();
    const schoolingRegistrationDependentUser = this.store.createRecord('schooling-registration-dependent-user', {
      organizationId: this.args.organizationId,
      schoolingRegistrationId: this.args.student.id
    });

    try {
      await schoolingRegistrationDependentUser.save();
      this.generatedPassword = schoolingRegistrationDependentUser.generatedPassword;
      this.isUniquePasswordVisible = !this.isUniquePasswordVisible;
    } catch (e) {
      this.notifications.sendError('Quelque chose s\'est mal passé. Veuillez réessayer.');
    }
  }

  @action
  closePasswordReset() {
    this.isUniquePasswordVisible = false;
    this.args.close();
  }
}
