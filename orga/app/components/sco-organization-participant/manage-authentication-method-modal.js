import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
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
    const dependentUser = this.store.createRecord('dependent-user', {
      organizationId: this.args.organizationId,
      organizationLearnerId: this.args.student.id,
    });

    try {
      await dependentUser.save();
      this.generatedPassword = dependentUser.generatedPassword;
      this.isUniquePasswordVisible = !this.isUniquePasswordVisible;
    } catch (e) {
      this.notifications.sendError(this._t('error.unexpected'));
    }
  }

  @action
  async generateUsernameWithTemporaryPassword(event) {
    event.preventDefault();
    const dependentUser = this.store.createRecord('dependent-user', {
      organizationId: this.args.organizationId,
      organizationLearnerId: this.args.student.id,
    });

    try {
      await dependentUser.save({ adapterOptions: { generateUsernameAndTemporaryPassword: true } });
      this.args.student.username = dependentUser.username;

      if (!this.args.student.email) {
        this.generatedPassword = dependentUser.generatedPassword;
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
    this.args.onClose();
  }

  _t(key) {
    return this.intl.t(`pages.sco-organization-participants.manage-authentication-method-modal.${key}`);
  }
}
