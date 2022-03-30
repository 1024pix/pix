const Joi = require('joi');

const schema = Joi.object({
  REDIS_URL: Joi.string().uri().optional(),
  DATABASE_URL: Joi.string().uri().optional(),
  TEST_DATABASE_URL: Joi.string().optional(),
  KNEX_ASYNC_STACKTRACE_ENABLED: Joi.string().optional().valid('true', 'false'),
  DATABASE_CONNECTION_POOL_MAX_SIZE: Joi.number().integer().min(0).optional(),
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
  LOG_FOR_HUMANS: Joi.string().optional().valid('true', 'false'),
  LOG_OPS_METRICS: Joi.string().optional().valid('true', 'false'),
  AUTH_SECRET: Joi.string().required(),
  SCO_ACCOUNT_RECOVERY_KEY_LIFETIME_MINUTES: Joi.number().integer().min(1).optional(),
  FT_CERTIFICATION_BILLING: Joi.string().optional().valid('true', 'false'),
  FT_NEW_TUTORIALS_PAGE: Joi.string().optional().valid('true', 'false'),
  NODE_ENV: Joi.string().optional().valid('development', 'test', 'production'),
  POLE_EMPLOI_CLIENT_ID: Joi.string().optional(),
  POLE_EMPLOI_CLIENT_SECRET: Joi.string().optional(),
  POLE_EMPLOI_TOKEN_URL: Joi.string().uri().optional(),
  POLE_EMPLOI_SENDING_URL: Joi.string().uri().optional(),
  CONTAINER_VERSION: Joi.string().optional(),
}).options({ allowUnknown: true });

const validateEnvironmentVariables = function () {
  const { error } = schema.validate(process.env);
  if (error) {
    throw new Error('Configuration is invalid: ' + error.message + ', but was: ' + error.details[0].context.value);
  }
};

module.exports = validateEnvironmentVariables;
