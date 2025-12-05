import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class FormValidatorService extends Service {
  @tracked errors = {};

  validateField({ fieldSchema, field, value, validatorProvider }) {
    const { error } = validatorProvider.validate({ schema: fieldSchema, data: value });

    if (error) {
      this.errors = { ...this.errors, [field]: error };
    } else {
      this.errors = { ...this.errors, [field]: null };
    }
  }

  validateForm({ schema, form, validatorProvider }) {
    const { error } = validatorProvider.validate({ schema, data: form });

    if (error) {
      this.errors = { ...error };
    } else {
      this.errors = {};
    }
  }

  resetValidationErrors() {
    this.errors = {};
  }
}
