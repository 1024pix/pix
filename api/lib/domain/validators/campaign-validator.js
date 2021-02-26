const Joi = require('joi');
const { first } = require('lodash');
const { EntityValidationError } = require('../errors');
const Campaign = require('../models/Campaign');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const campaignValidationJoiSchema = Joi.object({

  name: Joi.string()
    .required()
    .messages({
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

  creatorId: Joi.number()
    .integer()
    .required()
    .messages({
      'any.required': 'MISSING_CREATOR',
      'number.base': 'MISSING_CREATOR',
    }),

  organizationId: Joi.number()
    .integer()
    .required()
    .messages({
      'any.required': 'MISSING_ORGANIZATION',
      'number.base': 'MISSING_ORGANIZATION',
    }),

  targetProfileId: Joi.number()
    .when('$type', {
      switch: [{
        is: Joi.string().required().valid(Campaign.types.PROFILES_COLLECTION),
        then: Joi.valid(null).optional(),
      }, {
        is: Joi.string().required().valid(Campaign.types.ASSESSMENT),
        then: Joi.required(),
      }],
      otherwise: Joi.number().allow(null).optional(),
    })
    .integer()
    .messages({
      'any.required': 'TARGET_PROFILE_IS_REQUIRED',
      'number.base': 'TARGET_PROFILE_IS_REQUIRED',
      'any.only': 'TARGET_PROFILE_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
    }),

  idPixLabel: Joi.string()
    .allow(null)
    .min(3)
    .messages({
      'string.empty': 'EXTERNAL_USER_ID_IS_REQUIRED',
      'string.min': 'EXTERNAL_USER_ID_IS_REQUIRED',
    }),

  title: Joi.string()
    .allow(null)
    .when('$type', {
      is: Joi.string().required().valid(Campaign.types.PROFILES_COLLECTION),
      then: Joi.valid(null),
      otherwise: Joi.optional(),
    })
    .messages({
      'any.only': 'TITLE_OF_PERSONALISED_TEST_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
    }),

});

module.exports = {

  validate(campaign) {
    const { error } = campaignValidationJoiSchema.validate(campaign, {
      ...validationConfiguration,
      context: { type: campaign.type },
    });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
    return true;
  },
};
