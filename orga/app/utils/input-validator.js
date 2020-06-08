import { tracked } from '@glimmer/tracking';

export default class InputValidator {

  defaultMessage;
  validator;
  @tracked hasError = false;
  @tracked serverMessage;

  constructor(validator, defaultMessage) {
    this.validator = validator;
    this.defaultMessage = defaultMessage;
  }

  get message() {
    return this.serverMessage || this.defaultMessage;
  }

  validate({ value, resetServerMessage }) {
    if (resetServerMessage) {
      this.serverMessage = null;
    }
    this.hasError = !this.validator(value);
  }
}
