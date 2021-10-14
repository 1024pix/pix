import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import isEmpty from 'lodash/isEmpty';
import isEmailValid from '../../utils/email-validator';

const STATUS_MAP = {
  defaultStatus: 'default',
  errorStatus: 'error',
  successStatus: 'success',
};

const ERROR_INPUT_MESSAGE_MAP = {
  emailAlreadyExist: 'pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.email-already-exist',
  newEmailAlreadyExist:
    'pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.new-email-already-exist',
  emptyEmail: 'pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.empty-email',
  wrongEmailFormat: 'pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.wrong-email-format',
};

class EmailValidation {
  @tracked status = STATUS_MAP['defaultStatus'];
  @tracked message = null;
}

export default class BackupEmailConfirmationFormComponent extends Component {
  @service intl;

  @tracked email = '';
  @tracked emailValidation = new EmailValidation();

  get isSubmitButtonEnabled() {
    return isEmailValid(this.email) && !this._hasAPIRejectedCall() && !this.args.isLoading;
  }

  @action validateEmail() {
    this.args.resetErrors();
    this.email = this.email.trim();
    if (isEmpty(this.email)) {
      this.emailValidation.status = STATUS_MAP['errorStatus'];
      this.emailValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['emptyEmail']);
      return;
    }

    const isInvalidInput = !isEmailValid(this.email);
    if (isInvalidInput) {
      this.emailValidation.status = STATUS_MAP['errorStatus'];
      this.emailValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['wrongEmailFormat']);
      return;
    }

    this.emailValidation.status = STATUS_MAP['successStatus'];
    this.emailValidation.message = null;
  }

  @action
  async submitBackupEmailConfirmationForm(event) {
    event.preventDefault();
    this.emailValidation.status = STATUS_MAP['successStatus'];
    this.emailValidation.message = null;
    this.args.sendEmail(this.email);
  }

  _hasAPIRejectedCall() {
    return this.emailValidation.status === STATUS_MAP['errorStatus'];
  }
}
