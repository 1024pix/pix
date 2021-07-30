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
  @service store;
  @service intl;
  @service router;

  @tracked passwordValidation = new PasswordValidation();

  @tracked password = '';

  get isFormValid() {
    return !isEmpty(this.password) && this.passwordValidation.status !== 'error';
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
    const newPassword = this.store.createRecord('account-recovery-demand', {
      temporaryKey: this.args.temporaryKey,
      password: this.password,
    });
    try {
      await newPassword.update();
      this.router.transitionTo('login');
    } catch (err) {
      console.log(err);
    }
  }

}
