import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import get from 'lodash/get';

export default class ManageAuthenticationMethodModal extends Component {

  @service store;
  @service notifications;

  @tracked isUniquePasswordVisible = false;

  @tracked generatedPassword = null;

  @tracked tooltipTextUsername = 'Copier l\'identifiant';
  @tracked tooltipTextEmail = 'Copier l\'adresse e-mail';
  @tracked tooltipTextGeneratedPassword = 'Copier le mot de passe unique';

  defaultErrorMessage = 'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.';

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
      schoolingRegistrationId: this.args.student.id,
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
  async generateUsernameWithTemporaryPassword(event) {
    event.preventDefault();
    const schoolingRegistrationDependentUser = this.store.createRecord('schooling-registration-dependent-user', {
      organizationId: this.args.organizationId,
      schoolingRegistrationId: this.args.student.id,
    });

    try {
      await schoolingRegistrationDependentUser.save({ adapterOptions: { generateUsernameAndTemporaryPassword: true } });
      this.args.student.username = schoolingRegistrationDependentUser.username;

      if (!this.args.student.email) {
        this.generatedPassword = schoolingRegistrationDependentUser.generatedPassword;
        this.isUniquePasswordVisible = !this.isUniquePasswordVisible;
      }
    } catch (response) {
      const errorDetail = get(response, 'errors[0].detail', this.defaultErrorMessage);
      this.notifications.sendError(errorDetail);
    }
  }

  @action
  closeModal() {
    this.isUniquePasswordVisible = false;
    this.args.close();
  }
}
