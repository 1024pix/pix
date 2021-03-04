const Joi = require('joi');

const schema = Joi.object({
  REDIS_URL: Joi.string().uri().optional(),
  DATABASE_URL: Joi.string().uri().optional(),
  TEST_DATABASE_URL: Joi.string().optional(),
  MAILING_ENABLED: Joi.string().optional().valid('true', 'false'),
  MAILING_PROVIDER: Joi.string().optional().valid('sendinblue'),
  SENDINBLUE_API_KEY: Joi.string().optional(),
  SENDINBLUE_ACCOUNT_CREATION_TEMPLATE_ID: Joi.number().optional(),
  SENDINBLUE_ORGANIZATION_INVITATION_TEMPLATE_ID: Joi.number().optional(),
  SENDINBLUE_ORGANIZATION_INVITATION_SCO_TEMPLATE_ID: Joi.number().optional(),
  SENDINBLUE_PASSWORD_RESET_TEMPLATE_ID: Joi.number().optional(),
  SENDINBLUE_EMAIL_CHANGE_TEMPLATE_ID: Joi.number().optional(),
  TLD_FR: Joi.string().optional(),
  TLD_ORG: Joi.string().optional(),
  DOMAIN_PIX: Joi.string().optional(),
  DOMAIN_PIX_APP: Joi.string().optional(),
  DOMAIN_PIX_ORGA: Joi.string().optional(),
  LCMS_API_KEY: Joi.string().required(),
  LCMS_API_URL: Joi.string().uri().required(),
  LOG_ENABLED: Joi.string().optional().valid('true', 'false'),
  LOG_LEVEL: Joi.string().optional().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace'),
  AUTH_SECRET: Joi.string().required(),
}).options({ allowUnknown: true });

const validateEnvironmentVariables = function() {
  const { error } = schema.validate(process.env);
  if (error) {
    throw new Error('Configuration is invalid: ' + error.message + ', but was: ' + error.details[0].context.value);
  }

};

module.exports = validateEnvironmentVariables;
