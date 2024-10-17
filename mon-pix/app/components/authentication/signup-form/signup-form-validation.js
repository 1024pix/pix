import { tracked } from '@glimmer/tracking';
import camelCase from 'lodash/camelCase.js';

import isEmailValid from '../../../utils/email-validator.js';
import isPasswordValid from '../../../utils/password-validator.js';

const ERROR_INPUT_MESSAGE_MAP = {
  firstName: 'components.authentication.signup-form.fields.firstname.error',
  lastName: 'components.authentication.signup-form.fields.lastname.error',
  email: 'components.authentication.signup-form.fields.email.error',
  password: 'common.validation.password.error',
  cgu: 'common.cgu.error',
};

class FirstName {
  @tracked status = 'default';
  @tracked errorMessage = null;

  validate(value) {
    return Boolean(value);
  }
}

class LastName {
  @tracked status = 'default';
  @tracked errorMessage = null;

  validate(value) {
    return Boolean(value);
  }
}

class Email {
  @tracked status = 'default';
  @tracked errorMessage = null;

  validate(value) {
    return isEmailValid(value);
  }
}

class Password {
  @tracked status = 'default';
  @tracked errorMessage = null;

  validate(value) {
    return isPasswordValid(value);
  }
}

class Cgu {
  @tracked status = 'default';
  @tracked errorMessage = null;

  validate(value) {
    return value === true;
  }
}

export class SignupFormValidation {
  lastName = new LastName();
  firstName = new FirstName();
  email = new Email();
  password = new Password();
  cgu = new Cgu();

  constructor(intl) {
    this.intl = intl;
  }

  get isValid() {
    return [
      this.lastName.status,
      this.firstName.status,
      this.email.status,
      this.password.status,
      this.cgu.status,
    ].every((status) => status !== 'error');
  }

  validateField(field, value) {
    if (!this[field].validate) return;

    const isValidInput = this[field].validate(value);
    const status = isValidInput ? 'success' : 'error';

    this[field].status = status;
    this[field].errorMessage = status === 'error' ? this.intl.t(ERROR_INPUT_MESSAGE_MAP[field]) : null;
  }

  setErrorsFromServer(errors) {
    if (!errors || errors?.length === 0) return;

    errors.forEach(({ attribute, message }) => {
      const field = camelCase(attribute);

      if (!this[field]) return;
      this[field].status = 'error';
      this[field].errorMessage = message;
    });
  }
}
