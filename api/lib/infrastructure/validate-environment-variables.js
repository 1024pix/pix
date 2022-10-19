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
  TLD_FR: Joi.string().optional(),
  TLD_ORG: Joi.string().optional(),
  DOMAIN_PIX: Joi.string().optional(),
  DOMAIN_PIX_APP: Joi.string().optional(),
  DOMAIN_PIX_ORGA: Joi.string().optional(),
  LCMS_API_KEY: Joi.string().required(),
  LCMS_API_URL: Joi.string().uri().required(),
  LOG_ENABLED: Joi.string().optional().valid('true', 'false'),
  LOG_LEVEL: Joi.string().optional().valid('silent', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'),
  LOG_FOR_HUMANS: Joi.string().optional().valid('true', 'false'),
  LOG_OPS_METRICS: Joi.string().optional().valid('true', 'false'),
  AUTH_SECRET: Joi.string().required(),
  SCO_ACCOUNT_RECOVERY_KEY_LIFETIME_MINUTES: Joi.number().integer().min(1).optional(),
  FT_SSO_ACCOUNT_RECONCILIATION: Joi.string().optional().valid('true', 'false'),
  NODE_ENV: Joi.string().optional().valid('development', 'test', 'production'),
  POLE_EMPLOI_CLIENT_ID: Joi.string().optional(),
  POLE_EMPLOI_CLIENT_SECRET: Joi.string().optional(),
  POLE_EMPLOI_TOKEN_URL: Joi.string().uri().optional(),
  POLE_EMPLOI_SENDING_URL: Joi.string().uri().optional(),
  CNAV_AUTHENTICATION_URL: Joi.string().uri().optional(),
  CNAV_CLIENT_ID: Joi.string().optional(),
  CNAV_CLIENT_SECRET: Joi.string().optional(),
  CNAV_TOKEN_URL: Joi.string().uri().optional(),
  CONTAINER_VERSION: Joi.string().optional(),
  FORCE_DROP_DATABASE: Joi.string().optional().valid('true', 'false'),
  TEST_LOG_ENABLED: Joi.string().optional().valid('true', 'false'),
  TEST_REDIS_URL: Joi.string().optional(),
  RATE_LIMIT_ENABLED: Joi.string().optional().valid('true', 'false'),
  RATE_LIMIT_LOG_ONLY: Joi.string().optional().valid('true', 'false'),
  RATE_LIMIT_DEFAULT_LIMIT: Joi.number().optional(),
  RATE_LIMIT_DEFAULT_WINDOW: Joi.number().optional(),
  CPF_STORAGE_ACCESS_KEY_ID: Joi.string().optional(),
  CPF_STORAGE_SECRET_ACCESS_KEY: Joi.string().optional(),
  CPF_STORAGE_ENDPOINT: Joi.string().optional(),
  CPF_STORAGE_REGION: Joi.string().optional(),
  CPF_STORAGE_BUCKET_NAME: Joi.string().optional(),
  CPF_STORAGE_PRE_SIGNED_EXPIRES_IN: Joi.number().optional(),
  CPF_PLANNER_JOB_CHUNK_SIZE: Joi.number().optional(),
  CPF_PLANNER_JOB_MONTHS_TO_PROCESS: Joi.number().optional(),
  CPF_PLANNER_JOB_MINIMUM_RELIABILITY_PERIOD: Joi.number().optional(),
  CPF_PLANNER_JOB_CRON: Joi.string().optional(),
  CPF_SEND_EMAIL_JOB_RECIPIENT: Joi.string().optional(),
  CPF_SEND_EMAIL_JOB_CRON: Joi.string().optional(),
}).options({ allowUnknown: true });

const validateEnvironmentVariables = function () {
  // eslint-disable-next-line node/no-process-env
  const { error } = schema.validate(process.env);
  if (error) {
    throw new Error('Configuration is invalid: ' + error.message + ', but was: ' + error.details[0].context.value);
  }
};

module.exports = validateEnvironmentVariables;
