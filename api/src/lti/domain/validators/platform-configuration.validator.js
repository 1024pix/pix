import Joi from 'joi';

const ltiPlatformConfigurationSchema = Joi.object({
  messages_supported: Joi.array()
    .items(ltiMessage('LtiResourceLinkRequest').required(), ltiMessage('LtiDeepLinkingRequest').required())
    .required(),
}).unknown(true);

const platformOpenidConfigurationSchema = Joi.object({
  issuer: Joi.string().uri().required(),
  authorization_endpoint: Joi.string().uri().required(),
  registration_endpoint: Joi.string().uri().required(),
  jwks_uri: Joi.string().uri().required(),
  token_endpoint: Joi.string().uri().required(),
  token_endpoint_auth_methods_supported: Joi.array()
    .items(Joi.string().valid('private_key_jwt').required(), Joi.string())
    .required(),
  token_endpoint_auth_signing_alg_values_supported: Joi.array()
    .items(Joi.string().valid('RS256').required(), Joi.string())
    .required(),
  scopes_supported: Joi.array().items(Joi.string().valid('openid').required(), Joi.string()).required(),
  response_types_supported: Joi.array().items(Joi.string().valid('id_token').required(), Joi.string()).required(),
  claims_supported: Joi.array().items(Joi.string().valid('email').required(), Joi.string()).required(),
  'https://purl.imsglobal.org/spec/lti-platform-configuration': ltiPlatformConfigurationSchema.required(),
}).unknown(true);

function ltiMessage(type) {
  return Joi.object({
    type: Joi.string().valid(type).required(),
  }).unknown(true);
}

export function validatePlatformConfiguration(platformConfiguration) {
  return platformOpenidConfigurationSchema.validate(platformConfiguration).error;
}
