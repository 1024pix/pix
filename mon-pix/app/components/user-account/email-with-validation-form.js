import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import isEmailValid from '../../utils/email-validator';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';

const ERROR_INPUT_MESSAGE_MAP = {
  invalidEmail: 'pages.user-account.account-update-email-with-validation.fields.errors.invalid-email',
  emptyPassword: 'pages.user-account.account-update-email-with-validation.fields.errors.empty-password',
  emailAlreadyExist: 'pages.user-account.account-update-email-with-validation.fields.errors.new-email-already-exist',
  invalidPassword: 'pages.user-account.account-update-email-with-validation.fields.errors.invalid-password',
};

export default class EmailWithValidationForm extends Component {
  @service intl;
  @service store;
  @tracked newEmail = '';
  @tracked password = '';
  @tracked newEmailValidationMessage = null;
  @tracked passwordValidationMessage = null;
  @tracked errorMessage = null;

  get isFormValid() {
    return isEmailValid(this.newEmail) && !isEmpty(this.password);
  }

  @action
  validateNewEmail(event) {
    this.newEmail = event.target.value;
    const isInvalidInput = !isEmailValid(this.newEmail);

    this.newEmailValidationMessage = null;

    if (isInvalidInput) {
      this.newEmailValidationMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['invalidEmail']);
    }
  }

  @action
  validatePassword(event) {
    this.password = event.target.value;
    const isInvalidInput = isEmpty(this.password);

    this.passwordValidationMessage = null;

    if (isInvalidInput) {
      this.passwordValidationMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['emptyPassword']);
    }
  }

  @action
  async onSubmit(event) {
    event && event.preventDefault();
    this.errorMessage = null;

    if (this.isFormValid) {
      try {
        const emailVerificationCode = this.store.createRecord('email-verification-code', {
          password: this.password,
          newEmail: this.newEmail.trim().toLowerCase(),
        });
        await emailVerificationCode.send();
        this.args.showVerificationCode(this.newEmail);
      } catch (response) {
        const status = get(response, 'errors[0].status');
        if (status === '422') {
          const pointer = get(response, 'errors[0].source.pointer');
          if (pointer.endsWith('email')) {
            this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['invalidEmail']);
          }
          if (pointer.endsWith('password')) {
            this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['emptyPassword']);
          }
        } else if (status === '400') {
          const code = get(response, 'errors[0].code');
          this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['invalidPassword']);
          if (code === 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS') {
            this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['emailAlreadyExist']);
          }
        }
      }
    }
  }
}
