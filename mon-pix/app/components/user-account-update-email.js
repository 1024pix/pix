import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import isEmailValid from '../utils/email-validator';
import get from 'lodash/get';

const STATUS_MAP = {
  defaultStatus: 'default',
  errorStatus: 'error',
  successStatus: 'success',
};

const ERROR_INPUT_MESSAGE_MAP = {
  wrongFormat: 'pages.user-account.account-update-email.fields.errors.wrong-format',
  mismatching: 'pages.user-account.account-update-email.fields.errors.mismatching',
  unknown: 'pages.user-account.account-update-email.fields.errors.unknown',
};

class NewEmailValidation {
  @tracked status = STATUS_MAP['defaultStatus'];
  @tracked message = null;
}

class NewEmailConfirmationValidation {
  @tracked status = STATUS_MAP['defaultStatus'];
  @tracked message = null;
}

export default class UserAccountUpdateEmail extends Component {

  @service intl;
  @tracked newEmail = '';
  @tracked newEmailConfirmation = '';
  @tracked errorMessage = null;

  @tracked newEmailValidation = new NewEmailValidation();
  @tracked newEmailConfirmationValidation = new NewEmailConfirmationValidation();

  @action
  validateNewEmail() {
    const isInvalidInput = !isEmailValid(this.newEmail);

    this.newEmailValidation.status = STATUS_MAP['successStatus'];
    this.newEmailValidation.message = null;

    if (isInvalidInput) {
      this.newEmailValidation.status = STATUS_MAP['errorStatus'];
      this.newEmailValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['wrongFormat']);
    }
  }

  @action
  validateNewEmailConfirmation() {
    const isInvalidInput = !isEmailValid(this.newEmailConfirmation);

    this.newEmailConfirmationValidation.status = STATUS_MAP['successStatus'];
    this.newEmailConfirmationValidation.message = null;

    if (isInvalidInput) {
      this.newEmailConfirmationValidation.status = STATUS_MAP['errorStatus'];
      this.newEmailConfirmationValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['wrongFormat']);
    } else if (this.newEmail !== this.newEmailConfirmation) {
      this.newEmailConfirmationValidation.status = STATUS_MAP['errorStatus'];
      this.newEmailConfirmationValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['mismatching']);
    }
  }

  @action
  async onSubmit(event) {
    event && event.preventDefault();
    this.errorMessage = null;

    if (this.newEmail === this.newEmailConfirmation && isEmailValid(this.newEmail)) {
      try {
        await this.args.saveNewEmail(this.newEmail);
      } catch (response) {
        const status = get(response, 'errors[0].status');
        if (status === '422') {
          this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['wrongFormat']);
        } else if (status === '400' || status === '403') {
          this.errorMessage = get(response, 'errors[0].detail');
        } else {
          this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['unknown']);
        }
      }
    }
  }
}
