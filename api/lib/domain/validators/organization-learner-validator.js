const Joi = require('joi').extend(require('@joi/date'));
const { EntityValidationError } = require('../errors');
const OrganizationLearner = require('../models/OrganizationLearner');

const { STUDENT, APPRENTICE } = OrganizationLearner.STATUS;
const validationConfiguration = { allowUnknown: true };
const MAX_LENGTH = 255;
const CITY_CODE_LENGTH = 5;
const PROVINCE_CODE_MIN_LENGTH = 2;
const PROVINCE_CODE_MAX_LENGTH = 3;
const COUNTRY_CODE_LENGTH = 5;
const FRANCE_COUNTRY_CODE = '99100';

const INSEE_REGEX = {
  COUNTRY_CODE: /9{2}[1-5]{1}[0-9]{2}/,
  FRANCE_CITY_CODE: /[0-9]{5}|[0-9]{1}[a,b,A,B]{1}[0-9]{3}/,
};

const validationSchema = Joi.object({
  nationalIdentifier: Joi.string().max(MAX_LENGTH).required(),
  firstName: Joi.string().max(MAX_LENGTH).required(),
  middleName: Joi.string().max(MAX_LENGTH).optional(),
  thirdName: Joi.string().max(MAX_LENGTH).optional(),
  lastName: Joi.string().max(MAX_LENGTH).required(),
  preferredLastName: Joi.string().max(MAX_LENGTH).optional(),
  birthdate: Joi.date().required().format('YYYY-MM-DD').empty(null),
  birthProvinceCode: Joi.string().min(PROVINCE_CODE_MIN_LENGTH).max(PROVINCE_CODE_MAX_LENGTH).required(),
  birthCountryCode: Joi.string().length(COUNTRY_CODE_LENGTH).regex(INSEE_REGEX.COUNTRY_CODE).required(),
  status: Joi.string().valid(STUDENT, APPRENTICE).required(),
  MEFCode: Joi.string().max(MAX_LENGTH).required(),
  division: Joi.string().max(MAX_LENGTH).required(),
  organizationId: Joi.number().integer().required(),
  sex: Joi.string().valid('F', 'f', 'M', 'm').required(),
  birthCity: Joi.alternatives().conditional('birthCountryCode', {
    is: FRANCE_COUNTRY_CODE,
    then: Joi.string().max(MAX_LENGTH).optional(),
    otherwise: Joi.string().max(MAX_LENGTH).required(),
  }),
  birthCityCode: Joi.alternatives().conditional('birthCountryCode', {
    is: FRANCE_COUNTRY_CODE,
    then: Joi.string().length(CITY_CODE_LENGTH).regex(INSEE_REGEX.FRANCE_CITY_CODE).required(),
    otherwise: Joi.string().max(MAX_LENGTH).optional(),
  }),
});

module.exports = {
  FRANCE_COUNTRY_CODE,
  checkValidation(organizationLearner) {
    const { error } = validationSchema.validate(organizationLearner, validationConfiguration);

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
      if (type === 'string.length') {
        err.why = 'length';
        err.limit = context.limit;
      }
      if (type === 'string.min') {
        err.why = 'min_length';
        err.limit = context.limit;
      }
      if (type === 'string.pattern.base' && ['birthCountryCode', 'birthCityCode'].includes(context.key)) {
        err.why = 'not_valid_insee_code';
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
      if (type === 'string.pattern.name') {
        err.why = 'bad_pattern';
        err.pattern = context.name;
      }
      err.key = context.key;
      throw err;
    }
  },
};
