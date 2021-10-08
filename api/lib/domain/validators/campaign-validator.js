const Joi = require('joi');
const { first } = require('lodash');
const { EntityValidationError } = require('../errors');
const Campaign = require('../models/Campaign');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const campaignValidationJoiSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'CAMPAIGN_NAME_IS_REQUIRED',
    'string.empty': 'CAMPAIGN_NAME_IS_REQUIRED',
  }),

  type: Joi.string()
    .valid(Campaign.types.ASSESSMENT, Campaign.types.PROFILES_COLLECTION)
    .required()
    .error((errors) => first(errors))
    .messages({
      'any.required': 'CAMPAIGN_PURPOSE_IS_REQUIRED',
      'string.base': 'CAMPAIGN_PURPOSE_IS_REQUIRED',
      'any.only': 'CAMPAIGN_PURPOSE_IS_REQUIRED',
    }),

  creatorId: Joi.number().integer().required().messages({
    'any.required': 'MISSING_CREATOR',
    'number.base': 'MISSING_CREATOR',
  }),

  organizationId: Joi.number().integer().required().messages({
    'any.required': 'MISSING_ORGANIZATION',
    'number.base': 'MISSING_ORGANIZATION',
  }),

  targetProfileId: Joi.number()
    .when('type', {
      switch: [
        {
          is: Joi.string().required().valid(Campaign.types.PROFILES_COLLECTION),
          then: Joi.valid(null).optional(),
        },
        {
          is: Joi.string().required().valid(Campaign.types.ASSESSMENT),
          then: Joi.required(),
        },
      ],
      otherwise: Joi.number().allow(null).optional(),
    })
    .integer()
    .messages({
      'any.required': 'TARGET_PROFILE_IS_REQUIRED',
      'number.base': 'TARGET_PROFILE_IS_REQUIRED',
      'any.only': 'TARGET_PROFILE_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
    }),

  idPixLabel: Joi.string().allow(null).min(3).messages({
    'string.empty': 'EXTERNAL_USER_ID_IS_REQUIRED',
    'string.min': 'EXTERNAL_USER_ID_IS_REQUIRED',
  }),

  title: Joi.string()
    .allow(null)
    .when('type', {
      is: Joi.string().required().valid(Campaign.types.PROFILES_COLLECTION),
      then: Joi.valid(null),
      otherwise: Joi.optional(),
    })
    .messages({
      'any.only': 'TITLE_OF_PERSONALISED_TEST_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
    }),

  customResultPageText: Joi.string()
    .allow(null)
    .when('type', {
      is: Joi.string().required().valid(Campaign.types.PROFILES_COLLECTION),
      then: Joi.valid(null),
      otherwise: Joi.optional(),
    })
    .messages({
      'any.only': 'CUSTOM_RESULT_PAGE_TEXT_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
    }),

  customResultPageButtonText: Joi.when('type', {
    is: Joi.string().required().valid(Campaign.types.PROFILES_COLLECTION),
    then: Joi.valid(null),
    otherwise: Joi.when('customResultPageButtonUrl', {
      then: Joi.string().required(),
      otherwise: Joi.string().empty().allow(null),
    }),
  }).messages({
    'any.only': 'CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
    'string.base': 'CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_URL_IS_FILLED',
    'string.empty': 'CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_URL_IS_FILLED',
    'any.required': 'CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_URL_IS_FILLED',
  }),

  customResultPageButtonUrl: Joi.when('type', {
    is: Joi.string().required().valid(Campaign.types.PROFILES_COLLECTION),
    then: Joi.valid(null),
    otherwise: Joi.when('customResultPageButtonText', {
      then: Joi.string().uri().required(),
      otherwise: Joi.string().empty().allow(null),
    }),
  }).messages({
    'any.only': 'CUSTOM_RESULT_PAGE_BUTTON_URL_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
    'string.uri': 'CUSTOM_RESULT_PAGE_BUTTON_URL_MUST_BE_A_URL',
    'string.base': 'CUSTOM_RESULT_PAGE_BUTTON_URL_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_FILLED',
    'string.empty': 'CUSTOM_RESULT_PAGE_BUTTON_URL_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_FILLED',
    'any.required': 'CUSTOM_RESULT_PAGE_BUTTON_URL_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_FILLED',
  }),
});

module.exports = {
  validate(campaign) {
    const { error } = campaignValidationJoiSchema.validate(campaign, validationConfiguration);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
    return true;
  },
};
