import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import get from 'lodash/get';

export default class ManageAuthenticationMethodModal extends Component {

  @service store;
  @service notifications;
  @service intl;

  @tracked isUniquePasswordVisible = false;

  @tracked generatedPassword = null;

  @tracked tooltipTextUsername = this._t('section.username.copy');
  @tracked tooltipTextEmail = this._t('section.email.copy');
  @tracked tooltipTextGeneratedPassword = this._t('section.password.copy');

  defaultErrorMessage = this._t('error.default');

  @action
  clipboardSuccessUsername() {
    this.tooltipTextUsername = this._t('copied');
  }
  @action
  clipboardSuccessEmail() {
    this.tooltipTextEmail = this._t('copied');
  }
  @action
  clipboardSuccessGeneratedPassword() {
    this.tooltipTextGeneratedPassword = this._t('copied');
  }

  @action
  clipboardOutUsername() {
    this.tooltipTextUsername = this._t('section.username.copy');
  }
  @action
  clipboardOutEmail() {
    this.tooltipTextEmail = this._t('section.email.copy');
  }
  @action
  clipboardOutGeneratedPassword() {
    this.tooltipTextGeneratedPassword = this._t('section.password.copy');
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
      this.notifications.sendError(this._t('error.unexpected'));
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

  _t(key) {
    return this.intl.t(`pages.students-sco.manage-authentication-method-modal.${key}`);
  }
}
