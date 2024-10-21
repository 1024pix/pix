import { tracked } from '@glimmer/tracking';

import isPasswordValid from '../../../utils/password-validator';

export class PasswordResetFormValidation {
  passwordField = new PasswordField();

  constructor(intl) {
    this.intl = intl;
  }

  get isValid() {
    return this.passwordField.status !== 'error';
  }

  validateField(value) {
    const isValidInput = this.passwordField.validate(value);
    const status = isValidInput ? 'success' : 'error';

    this.passwordField.status = status;
    this.passwordField.errorMessage = status === 'error' ? this.intl.t('common.validation.password.error') : null;
  }
}

class PasswordField {
  @tracked status = 'default';
  @tracked errorMessage = null;

  validate(value) {
    return isPasswordValid(value);
  }
}
