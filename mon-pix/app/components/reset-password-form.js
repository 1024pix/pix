import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import isPasswordValid from '../utils/password-validator';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

export default class ResetPasswordForm extends Component {
  @service url;
  @service intl;

  @tracked hasSucceeded = false;
  validation = {
    @tracked status: 'default',
    @tracked message: null,
  };

  get homeUrl() {
    return this.url.homeUrl;
  }

  @action
  validatePassword() {
    const password = this.args.user.password;
    if (isPasswordValid(password)) {
      this._resetValidation();
    } else {
      this.validation.status = 'error';
      this.validation.message = this.intl.t('pages.reset-password.error.wrong-format');
    }
  }

  @action
  async handleResetPassword(event) {
    event && event.preventDefault();

    this.hasSucceeded = false;
    try {
      await this.args.user.save({ adapterOptions: { updatePassword: true, temporaryKey: this.args.temporaryKey } });
      this._resetValidation();
      this.hasSucceeded = true;
      this.args.user.password = null;
    } catch (response) {
      const status = get(response, 'errors[0].status');
      this.validation.status = 'error';
      switch (status) {
        case '400':
          this.validation.message = this.intl.t('pages.reset-password.error.wrong-format');
          break;
        case '403':
          this.validation.message = this.intl.t('pages.reset-password.error.forbidden');
          break;
        case '404':
          this.validation.message = this.intl.t('pages.reset-password.error.expired-demand');
          break;
        case '500':
          this.validation.message = this.intl.t('api-error-messages.internal-server-error');
          break;
        default:
          this.validation.message = this.intl.t('api-error-messages.internal-server-error');
          break;
      }
    }
  }

  _resetValidation() {
    this.validation.status = 'default';
    this.validation.message = null;
  }
}
