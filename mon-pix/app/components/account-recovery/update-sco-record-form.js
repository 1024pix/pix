import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import isEmpty from 'lodash/isEmpty';
import isPasswordValid from '../../utils/password-validator';

const STATUS_MAP = {
  defaultStatus: 'default',
  errorStatus: 'error',
  successStatus: 'success',
};

const ERROR_INPUT_MESSAGE_MAP = {
  emptyPassword: 'pages.account-recovery.update-sco-record.form.errors.empty-password',
  wrongPasswordFormat: 'pages.account-recovery.update-sco-record.form.errors.invalid-password',
};

class PasswordValidation {
  @tracked status = STATUS_MAP['defaultStatus'];
  @tracked message = null;
}

export default class UpdateScoRecordFormComponent extends Component {
  @service intl;
  @service url;

  @tracked cguAndProtectionPoliciesAccepted = false;
  @tracked password = '';
  @tracked passwordValidation = new PasswordValidation();

  get cguUrl() {
    return this.url.cguUrl;
  }

  get dataProtectionPolicyUrl() {
    return this.url.dataProtectionPolicyUrl;
  }

  get isSubmitButtonEnabled() {
    return (
      isPasswordValid(this.password) &&
      !this._hasAPIRejectedCall() &&
      this.cguAndProtectionPoliciesAccepted &&
      !this.args.isLoading
    );
  }

  @action validatePassword() {
    if (isEmpty(this.password)) {
      this.passwordValidation.status = STATUS_MAP['errorStatus'];
      this.passwordValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['emptyPassword']);
      return;
    }

    const isInvalidInput = !isPasswordValid(this.password);
    if (isInvalidInput) {
      this.passwordValidation.status = STATUS_MAP['errorStatus'];
      this.passwordValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['wrongPasswordFormat']);
      return;
    }

    this.passwordValidation.status = STATUS_MAP['successStatus'];
    this.passwordValidation.message = null;
  }

  @action
  async submitUpdate(event) {
    event.preventDefault();
    this.passwordValidation.status = STATUS_MAP['successStatus'];
    this.passwordValidation.message = null;
    this.args.updateRecord(this.password);
  }

  _hasAPIRejectedCall() {
    return this.passwordValidation.status === STATUS_MAP['errorStatus'];
  }
}
