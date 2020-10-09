const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const { EntityValidationError } = require('../errors');

const validationConfiguration = { allowUnknown: true };
const MAX_LENGTH = 255;
const CITY_CODE_MAX_LENGTH = 5;
const PROVINCE_CODE_MAX_LENGTH = 3;
const COUNTRY_CODE_MAX_LENGTH = 5;
const STATUSES = ['ST', 'AP'];
const FRANCE_COUNTRY_CODE = '99100';

const validationSchema = Joi.object({
  nationalStudentId: Joi.string().max(MAX_LENGTH).required(),
  firstName: Joi.string().max(MAX_LENGTH).required(),
  middleName: Joi.string().max(MAX_LENGTH).optional(),
  thirdName: Joi.string().max(MAX_LENGTH).optional(),
  lastName: Joi.string().max(MAX_LENGTH).required(),
  preferredLastName: Joi.string().max(MAX_LENGTH).optional(),
  birthdate: Joi.date().required().format('YYYY-MM-DD').empty(null),
  birthCity: Joi.alternatives().conditional('birthCountryCode', { 
    is: FRANCE_COUNTRY_CODE,
    then: Joi.string().max(MAX_LENGTH).optional(),
    otherwise: Joi.string().max(MAX_LENGTH).required(),
  }),
  birthCityCode: Joi.alternatives().conditional('birthCountryCode', {
    is: FRANCE_COUNTRY_CODE,
    then: Joi.string().max(CITY_CODE_MAX_LENGTH).required(),
    otherwise: Joi.string().max(CITY_CODE_MAX_LENGTH).optional(),
  }),
  birthProvinceCode: Joi.string().max(PROVINCE_CODE_MAX_LENGTH).required(),
  birthCountryCode: Joi.string().max(COUNTRY_CODE_MAX_LENGTH).required(),
  status: Joi.string().valid(...STATUSES).required(),
  MEFCode: Joi.string().max(MAX_LENGTH).required(),
  division: Joi.string().max(MAX_LENGTH).required(),
  organizationId: Joi.number().integer().required(),
});

module.exports = {
  checkValidation(registration) {
    const { error } = validationSchema.validate(registration, validationConfiguration);
    if (error) {
      const err = EntityValidationError.fromJoiErrors(error.details);
      const { type, context } = error.details[0];
      if (type === 'any.required') {
        err.why = 'required';
      }
      if (type === 'string.max') {
        err.why = 'max_length';
        err.limit = context.limit;
      }
      if (type === 'date.format') {
        err.why = 'not_a_date';
      }
      if (type === 'date.base') {
        err.why = 'not_a_date';
      }
      if (type === 'any.only') {
        err.why = 'bad_values';
        err.valids = context.valids;
      }
      err.key = context.key;
      throw err;
    }
  },
};
