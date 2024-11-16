import { tracked } from '@glimmer/tracking';
import camelCase from 'lodash/camelCase.js';

/**
 * Manages form validation with configurable validation rules for each form field.
 */
export class FormValidation {
  /**
   * @param {Record<string, Object>} validations - A map of form field names to validation options.
   * @example new FormValidation({ email: { validate: (value) => isValidEmail(value), error: 'Bad email' } })
   */
  constructor(validations = {}) {
    this.validations = validations;

    Object.entries(validations).forEach(([name, options]) => {
      this[name] = new Validation(options);
    });
  }

  /**
   * Validates all fields in the form based on the configured validation rules.
   * @param {Record<string, any>} - The current values of form fields to validate.
   * @returns {boolean} - Returns true if all fields pass validation.
   */
  validateAll(values = {}) {
    const validatedFields = Object.keys(this.validations).map((name) => this[name]?.validate(values[name]));
    return validatedFields.every((isValid) => isValid === true);
  }

  /**
   * Updates validation status for fields based on API error responses.
   * @param {Array<{attribute: string, message: string}>} errors - List of errors from API response.
   */
  setErrorsFromApi(errors) {
    if (!errors || errors?.length === 0) return;

    errors.forEach(({ attribute, message }) => {
      const name = camelCase(attribute);
      if (!this[name]) return;

      this[name].status = 'error';
      this[name].apiError = message;
    });
  }
}

/**
 * Represents validation status and rules for a single form field.
 */
class Validation {
  @tracked status = 'default';
  @tracked apiError = null;

  /**
   * @param {Object} options - Validation options for the field.
   * @param {Function} options.validate - Function to validate the field's value.
   * @param {string} options.error - Error message if validation fails.
   */
  constructor(options) {
    this.options = options;
  }

  /**
   * Checks if the field's current status is valid.
   * @returns {boolean} - True if the field is valid.
   */
  get isValid() {
    return this.status !== 'error';
  }

  /**
   * Retrieves the error message if the field is invalid.
   * @returns {string|null} - The error message or null if the field is valid.
   */
  get error() {
    if (this.isValid) return null;
    return this.options.error;
  }

  /**
   * Validates the field's value based on the provided validate function in options.
   * @param {any} value - The field value to validate.
   * @returns {boolean} - True if the field is valid after validation.
   */
  validate(value) {
    if (!this.options.validate) return;

    const isValidInput = this.options.validate(value);
    this.status = isValidInput ? 'success' : 'error';
    this.apiError = null;

    return this.isValid;
  }
}
