import Joi from 'joi';
import lodash from 'lodash';
import { EntityValidationError } from '../../../src/shared/domain/errors.js';
import { CampaignTypes } from '../models/CampaignTypes.js';

const { first } = lodash;
const schema = Joi.object({
  type: Joi.string()
    .valid(CampaignTypes.ASSESSMENT, CampaignTypes.PROFILES_COLLECTION)
    .required()
    .error((errors) => first(errors))
    .messages({
      'any.required': 'CAMPAIGN_PURPOSE_IS_REQUIRED',
      'string.base': 'CAMPAIGN_PURPOSE_IS_REQUIRED',
      'any.only': 'CAMPAIGN_PURPOSE_IS_REQUIRED',
    }),

  name: Joi.string().required().messages({
    'string.base': 'CAMPAIGN_NAME_IS_REQUIRED',
    'string.empty': 'CAMPAIGN_NAME_IS_REQUIRED',
  }),

  creatorId: Joi.number().integer().required().messages({
    'any.required': 'MISSING_CREATOR',
    'number.base': 'MISSING_CREATOR',
  }),

  customLandingPageText: Joi.string().empty('').allow(null).default(null).max(5000).messages({
    'string.max': 'CUSTOM_LANDING_PAGE_TEXT_IS_TOO_LONG',
  }),

  customResultPageText: Joi.string().empty('').allow(null).default(null).max(5000).messages({
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

  ownerId: Joi.number().integer().required().messages({
    'any.required': 'MISSING_OWNER',
    'number.base': 'MISSING_OWNER',
  }),

  organizationId: Joi.number().integer().required().messages({
    'any.required': 'MISSING_ORGANIZATION',
    'number.base': 'MISSING_ORGANIZATION',
  }),

  targetProfileId: Joi.number()
    .when('type', {
      switch: [
        {
          is: Joi.string().required().valid(CampaignTypes.PROFILES_COLLECTION),
          then: Joi.valid(null).optional(),
        },
        {
          is: Joi.string().required().valid(CampaignTypes.ASSESSMENT),
          then: Joi.required(),
        },
      ],
    })
    .integer()
    .messages({
      'any.required': 'TARGET_PROFILE_IS_REQUIRED',
      'number.base': 'TARGET_PROFILE_IS_REQUIRED',
      'any.only': 'TARGET_PROFILE_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
    }),

  title: Joi.string()
    .empty('')
    .allow(null)
    .default(null)
    .when('type', {
      is: Joi.string().required().valid(CampaignTypes.PROFILES_COLLECTION),
      then: Joi.valid(null),
      otherwise: Joi.optional(),
    })
    .messages({
      'any.only': 'TITLE_OF_PERSONALISED_TEST_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
    }),
});

function validate(campaign) {
  const { error } = schema.validate(campaign, { abortEarly: false, allowUnknown: true });
  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }
  return true;
}

export { validate };
