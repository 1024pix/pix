const Joi = require('joi');
const validLettersInAccessCode = 'ABCDEFGHIJKLMNOPQRSTUVWXZ'.split('');
const validNumbersInAccessCode = '0123456789'.split('');
const { ObjectValidationError } = require('../errors/ObjectValidationError');

class AccessCode {
  constructor({
    value,
  }) {
    this.value = value;

    validate(this);
  }

  static generate(pickOneFrom) {
    const value =
      pickOneFrom(validLettersInAccessCode) +
      pickOneFrom(validLettersInAccessCode) +
      pickOneFrom(validLettersInAccessCode) +
      pickOneFrom(validLettersInAccessCode) +
      pickOneFrom(validNumbersInAccessCode) +
      pickOneFrom(validNumbersInAccessCode);
    return new AccessCode({ value });
  }
}

const schema = Joi.object({
  value: Joi.string().regex(/[A-Z]{4}[0-9]{2}/).required(),
});

function validate(accessCode) {
  const { error } = schema.validate(accessCode);

  if (error) {
    throw new ObjectValidationError(error);
  }
}

module.exports = {
  AccessCode,
};
