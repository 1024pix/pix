import Joi from 'joi';
import lodash from 'lodash';

const { first } = lodash;

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { CampaignTypes } from '../read-models/CampaignTypes.js';

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const campaignValidationJoiSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.base': 'CAMPAIGN_NAME_IS_REQUIRED',
    'string.empty': 'CAMPAIGN_NAME_IS_REQUIRED',
  }),

  type: Joi.string()
    .valid(CampaignTypes.ASSESSMENT, CampaignTypes.PROFILES_COLLECTION)
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

  idPixLabel: Joi.string().allow(null).default(null).min(3).messages({
    'string.empty': 'EXTERNAL_USER_ID_IS_REQUIRED',
    'string.min': 'EXTERNAL_USER_ID_IS_REQUIRED',
  }),

  title: Joi.string()
    .allow(null)
    .default(null)
    .max(50)
    .when('type', {
      is: Joi.string().required().valid(CampaignTypes.PROFILES_COLLECTION),
      then: Joi.valid(null),
      otherwise: Joi.optional(),
    })
    .messages({
      'any.only': 'TITLE_OF_PERSONALISED_TEST_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
      'string.max': 'CAMPAIGN_TITLE_IS_TOO_LONG',
    }),

  customLandingPageText: Joi.string().allow(null).default(null).max(5000).messages({
    'string.max': 'CUSTOM_LANDING_PAGE_TEXT_IS_TOO_LONG',
  }),

  customResultPageText: Joi.string()
    .allow(null)
    .default(null)
    .max(5000)
    .when('type', {
      is: Joi.string().required().valid(CampaignTypes.PROFILES_COLLECTION),
      then: Joi.valid(null),
      otherwise: Joi.optional(),
    })
    .messages({
      'any.only': 'CUSTOM_RESULT_PAGE_TEXT_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
      'string.max': 'CUSTOM_RESULT_PAGE_TEXT_IS_TOO_LONG',
    }),

  customResultPageButtonText: Joi.when('type', {
    is: Joi.string().required().valid(CampaignTypes.PROFILES_COLLECTION),
    then: Joi.valid(null),
    otherwise: Joi.when('customResultPageButtonUrl', {
      then: Joi.string().required(),
      otherwise: Joi.string().allow(null).default(null),
    }),
  }).messages({
    'any.only': 'CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
    'string.base': 'CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_URL_IS_FILLED',
    'string.empty': 'CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_URL_IS_FILLED',
    'any.required': 'CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_URL_IS_FILLED',
  }),

  customResultPageButtonUrl: Joi.when('type', {
    is: Joi.string().required().valid(CampaignTypes.PROFILES_COLLECTION),
    then: Joi.valid(null),
    otherwise: Joi.when('customResultPageButtonText', {
      then: Joi.string().uri().required(),
      otherwise: Joi.string().allow(null).default(null),
    }),
  }).messages({
    'any.only': 'CUSTOM_RESULT_PAGE_BUTTON_URL_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
    'string.uri': 'CUSTOM_RESULT_PAGE_BUTTON_URL_MUST_BE_A_URL',
    'string.base': 'CUSTOM_RESULT_PAGE_BUTTON_URL_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_FILLED',
    'string.empty': 'CUSTOM_RESULT_PAGE_BUTTON_URL_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_FILLED',
    'any.required': 'CUSTOM_RESULT_PAGE_BUTTON_URL_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_FILLED',
  }),

  multipleSendings: Joi.boolean().required().messages({
    'any.required': 'MULTIPLE_SENDINGS_CHOICE_IS_REQUIRED',
    'boolean.base': 'MULTIPLE_SENDINGS_CHOICE_IS_REQUIRED',
  }),
});

const validate = function (campaign) {
  const { error } = campaignValidationJoiSchema.validate(campaign, validationConfiguration);
  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }
  return true;
};

export { validate };
