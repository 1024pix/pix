import Joi from 'joi';

import { EntityValidationError } from '../../../shared/domain/errors.js';

const schema = Joi.object({
  accessTokenLifespan: Joi.string().optional().default('7d'),
  additionalRequiredProperties: Joi.object().optional(),
  claimsToStore: Joi.string().optional(),
  clientId: Joi.string().required(),
  clientSecret: Joi.string().required(),
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
  source: Joi.string().optional(),
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
 * @typedef AddOidcProviderValidator
 * @type {object}
 * @property validate
 */
export const addOidcProviderValidator = { validate };
