import Joi from 'joi';

import { EntityValidationError } from '../../../shared/domain/errors.js';
import { VALID_APPLICATIONS } from '../../../shared/infrastructure/utils/network.js';
const schema = Joi.object({
  accessTokenLifespan: Joi.string().optional().default('7d'),
  additionalRequiredProperties: Joi.object().optional(),
  application: Joi.string()
    .valid(...VALID_APPLICATIONS)
    .required(),
  applicationTld: Joi.string().valid('.fr', '.org').required(),
  claimMapping: Joi.object().optional(),
  claimsToStore: Joi.string().optional(),
  clientId: Joi.string().required(),
  clientSecret: Joi.string().required(),
  connectionMethodCode: Joi.string().optional(),
  enabled: Joi.boolean().optional().default(false),
  enabledForPixAdmin: Joi.boolean().optional().default(false),
  extraAuthorizationUrlParameters: Joi.object().optional(),
  identityProvider: Joi.string().required(),
  openidClientExtraMetadata: Joi.object().optional(),
  openidConfigurationUrl: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  organizationName: Joi.string().required(),
  postLogoutRedirectUri: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional(),
  redirectUri: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  scope: Joi.string().required(),
  shouldCloseSession: Joi.boolean().optional().default(false),
  slug: Joi.string().required(),
  source: Joi.string().required(),
  isVisible: Joi.boolean().optional().default(true),
});

/**
 * @param oidcProvider
 * @return {boolean|EntityValidationError}
 */
function validate(oidcProvider) {
  const { error } = schema.validate(oidcProvider, { abortEarly: false });

  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }

  return true;
}

/**
 * @returns {string}
 */
function getImportTemplate() {
  const schemaForSingleOidcProvider = Object.fromEntries(Object.keys(schema.describe().keys).map((key) => [key, null]));
  const schemaForMultipleOidcProvider = [schemaForSingleOidcProvider];
  return JSON.stringify(schemaForMultipleOidcProvider, null, 2);
}

/**
 * @typedef AddOidcProviderValidator
 * @type {object}
 * @property validate
 */
export const addOidcProviderValidator = { validate, getImportTemplate };
