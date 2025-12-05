import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Joi from 'joi';

export default class FormValidatorService extends Service {
  @tracked errors = {};

  validateField({ fieldSchema, field, value }) {
    if (!Joi.isSchema(fieldSchema)) {
      return console.error('Please provide a valid Joi schema');
    }
    const { error } = fieldSchema.validate(value);

    const formattedError = this.#formatJoiErrors(error);

    if (error) {
      this.errors = { ...this.errors, [field]: formattedError };
    } else {
      this.errors = { ...this.errors, [field]: null };
    }
  }

  validateForm({ schema, form }) {
    if (!Joi.isSchema(schema)) {
      return console.error('Please provide a valid Joi schema');
    }
    const { error } = schema.validate(form, { abortEarly: false });

    const formattedError = this.#formatJoiErrors(error);

    if (error) {
      this.errors = { ...formattedError };
    } else {
      this.errors = {};
    }
  }

  resetValidationErrors() {
    this.errors = {};
  }

  #formatJoiErrors(error) {
    if (!error || !error.details) return null;
    return error.details.reduce((result, detail) => {
      const key = detail.path.join('.');
      if (!key.length) return detail.message;

      if (!result[key]) {
        result[key] = detail.message;
      }
      return result;
    }, {});
  }
}
