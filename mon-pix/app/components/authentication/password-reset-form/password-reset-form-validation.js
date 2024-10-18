import { tracked } from '@glimmer/tracking';

import isPasswordValid from '../../../utils/password-validator';

class Password {
  @tracked status = 'default';
  @tracked errorMessage = null;

  validate(value) {
    return isPasswordValid(value);
  }
}

export class PasswordResetFormValidation {
  password = new Password();

  constructor(intl) {
    this.intl = intl;
  }

  get isValid() {
    return this.password.status !== 'error';
  }

  validateField(value) {
    const isValidInput = this.password.validate(value);
    const status = isValidInput ? 'success' : 'error';

    this.password.status = status;
    this.password.errorMessage = status === 'error' ? this.intl.t('common.validation.password.error') : null;
  }
}
