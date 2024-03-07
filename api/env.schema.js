import Joi from 'joi';

export const schema = Joi.object({
  // CACHING
  CACHE_RELOAD_TIME: Joi.string().optional(),
  REDIS_URL: Joi.string()
    .optional()
    .uri({ scheme: ['redis'] }),

  // DATABASES
  DATABASE_CONNECTION_POOL_MAX_SIZE: Joi.number().optional().default(4),
  DATABASE_CONNECTION_POOL_MIN_SIZE: Joi.number().optional().default(1),
  DATABASE_URL: Joi.string()
    .required()
    .uri({ scheme: ['postgresql'] }),
  FORCE_DROP_DATABASE: Joi.boolean().optional(),
  KNEX_ASYNC_STACKTRACE_ENABLED: Joi.boolean().optional().default(false),
  KNOWLEDGE_ELEMENTS_BIGINT_MIGRATION_CHUNK_SIZE: Joi.number().optional(),
  NODE_ENV: Joi.string().optional().valid('development', 'production', 'test'),
  TEST_DATABASE_URL: Joi.string()
    .required()
    .uri({ scheme: ['postgresql'] }),

  // PGBOSS CONFIGURATION
  PGBOSS_CONNECTION_POOL_MAX_SIZE: Joi.number().optional().default(2),
  PGBOSS_MONITOR_STATE_INTERVAL_SECONDS: Joi.number().optional().default(2),

  // EMAILING
  BREVO_ACCOUNT_CREATION_TEMPLATE_ID: Joi.number().when('MAILING_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  BREVO_ACCOUNT_RECOVERY_TEMPLATE_ID: Joi.number().when('MAILING_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  BREVO_CLEA_ACQUIRED_RESULT_TEMPLATE_ID: Joi.number().when('MAILING_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  BREVO_EMAIL_VERIFICATION_CODE_TEMPLATE_ID: Joi.number().when('MAILING_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  BREVO_API_KEY: Joi.string().when('MAILING_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  BREVO_ORGANIZATION_INVITATION_SCO_TEMPLATE_ID: Joi.number().when('MAILING_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  BREVO_ORGANIZATION_INVITATION_TEMPLATE_ID: Joi.number().when('MAILING_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  BREVO_PASSWORD_RESET_TEMPLATE_ID: Joi.number().when('MAILING_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  BREVO_TARGET_PROFILE_NOT_CERTIFIABLE_TEMPLATE_ID: Joi.number().when('MAILING_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  DOMAIN_PIX: Joi.string().optional().default('pix'),
  DOMAIN_PIX_APP: Joi.string().optional().default('app.pix'),
  DOMAIN_PIX_CERTIF: Joi.string().optional().default('certif.pix'),
  DOMAIN_PIX_ORGA: Joi.string().optional().default('orga.pix'),
  MAILING_ENABLED: Joi.boolean().optional().default(false),
  MAILING_PROVIDER: Joi.string().when('MAILING_ENABLED', {
    is: true,
    then: Joi.required().valid('brevo'),
    otherwise: Joi.optional(),
  }),
  MAILING_SMTP_URL: Joi.string()
    .optional()
    .uri({ scheme: ['smtp'] }),
  TLD_FR: Joi.string().optional().default('.fr'),
  TLD_ORG: Joi.string().optional().default('.org'),

  // API MANAGER
  APIM_URL: Joi.string()
    .optional()
    .uri({ scheme: ['https'] })
    .default('https://gateway.pix.fr'),

  // LEARNING CONTENT
  LCMS_API_KEY: Joi.string().required().guid({ version: 'uuidv4' }),
  LCMS_API_URL: Joi.string()
    .required()
    .uri({ scheme: ['https'] }),

  // LOGGING
  DEBUG: Joi.string().optional(),
  LOG_ENABLED: Joi.boolean().optional().default(true),
  LOG_ENDING_EVENT_DISPATCH: Joi.boolean().optional().default(true),
  LOG_LEVEL: Joi.string()
    .optional()
    .valid('silent', 'fatal', 'error', 'warn', 'info', 'debug', 'trace')
    .default('info'),
  LOG_FOR_HUMANS: Joi.boolean().optional().default(true),
  LOG_OPS_METRICS: Joi.boolean().optional().default(false),
  LOG_STARTING_EVENT_DISPATCH: Joi.boolean().optional().default(true),
  OPS_EVENT_EACH_SECONDS: Joi.number().optional().default(15),

  // ERROR COLLECTING
  SENTRY_DEBUG: Joi.boolean().optional().default(false),
  SENTRY_DSN: Joi.string()
    .uri({ scheme: ['https'] })
    .when('SENTRY_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  SENTRY_ENABLED: Joi.boolean().optional().default(false),
  SENTRY_ENVIRONMENT: Joi.string().optional(),
  SENTRY_MAX_BREADCRUMBS: Joi.number().optional().default(100),

  // SECURITY
  AUTH_SECRET: Joi.string().required().min(32),
  SCO_ACCOUNT_RECOVERY_KEY_LIFETIME_MINUTES: Joi.number().optional().default(1440),

  // SAML CONFIGURATION
  SAML_IDP_CONFIG: Joi.string().optional(),
  SAML_SP_CONFIG: Joi.string().optional(),

  // OIDC FRANCE TRAVAIL CONFIGURATION
  POLE_EMPLOI_ACCESS_TOKEN_LIFESPAN: Joi.string().optional().default('7d'),
  POLE_EMPLOI_CLIENT_ID: Joi.string().when('POLE_EMPLOI_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  POLE_EMPLOI_CLIENT_SECRET: Joi.string().when('POLE_EMPLOI_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  POLE_EMPLOI_ENABLED: Joi.boolean().optional().default(false),
  POLE_EMPLOI_ID_TOKEN_LIFESPAN: Joi.string().optional().default('7d'),
  POLE_EMPLOI_OIDC_AFTER_LOGOUT_URL: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('POLE_EMPLOI_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  POLE_EMPLOI_OIDC_LOGOUT_URL: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('POLE_EMPLOI_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  POLE_EMPLOI_OPENID_CONFIGURATION_URL: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('POLE_EMPLOI_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  POLE_EMPLOI_REDIRECT_URI: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('POLE_EMPLOI_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  POLE_EMPLOI_SENDING_URL: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('PUSH_DATA_TO_POLE_EMPLOI_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  POLE_EMPLOI_TOKEN_URL: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('POLE_EMPLOI_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  PUSH_DATA_TO_POLE_EMPLOI_ENABLED: Joi.boolean().required().default(true),

  // CNAV CONFIGURATION
  CNAV_ACCESS_TOKEN_LIFESPAN: Joi.string().optional().default('7d'),
  CNAV_CLIENT_ID: Joi.string().when('CNAV_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  CNAV_CLIENT_SECRET: Joi.string().when('CNAV_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  CNAV_ENABLED: Joi.boolean().optional().default(false),
  CNAV_OPENID_CONFIGURATION_URL: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('CNAV_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  CNAV_REDIRECT_URI: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('CNAV_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),

  // FWB CONFIGURATION
  FWB_ACCESS_TOKEN_LIFESPAN: Joi.string().optional().default('7d'),
  FWB_CLAIMS_TO_STORE: Joi.string().optional(),
  FWB_CLIENT_ID: Joi.string().when('FWB_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  FWB_CLIENT_SECRET: Joi.string().when('FWB_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  FWB_ENABLED: Joi.boolean().optional().default(false),
  FWB_ID_TOKEN_LIFESPAN: Joi.string().optional().default('7d'),
  FWB_OIDC_LOGOUT_URL: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('FWB_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  FWB_OPENID_CONFIGURATION_URL: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('FWB_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  FWB_REDIRECT_URI: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('FWB_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),

  // PAYS DE LA LOIRE CONFIGURATION
  PAYSDELALOIRE_ACCESS_TOKEN_LIFESPAN: Joi.string().optional().default('7d'),
  PAYSDELALOIRE_CLIENT_ID: Joi.string().when('PAYSDELALOIRE_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  PAYSDELALOIRE_CLIENT_SECRET: Joi.string().when('PAYSDELALOIRE_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  PAYSDELALOIRE_ENABLED: Joi.boolean().optional().default(false),
  PAYSDELALOIRE_END_SESSION_URL: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('PAYSDELALOIRE_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  PAYSDELALOIRE_ID_TOKEN_LIFESPAN: Joi.string().optional().default('7d'),
  PAYSDELALOIRE_OPENID_CONFIGURATION_URL: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('PAYSDELALOIRE_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  PAYSDELALOIRE_POST_LOGOUT_REDIRECT_URI: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('PAYSDELALOIRE_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  PAYSDELALOIRE_REDIRECT_URI: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('PAYSDELALOIRE_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),

  // GOOGLE CONFIGURATION
  GOOGLE_ACCESS_TOKEN_LIFESPAN: Joi.string().optional().default('7d'),
  GOOGLE_CLIENT_ID: Joi.string()
    .when('GOOGLE_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() })
    .when('GOOGLE_ENABLED_FOR_PIX_ADMIN', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  GOOGLE_CLIENT_SECRET: Joi.string()
    .when('GOOGLE_ENABLED', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .when('GOOGLE_ENABLED_FOR_PIX_ADMIN', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  GOOGLE_ENABLED: Joi.boolean().optional().default(false),
  GOOGLE_ENABLED_FOR_PIX_ADMIN: Joi.boolean().optional().default(false),
  GOOGLE_OPENID_CONFIGURATION_URL: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('GOOGLE_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() })
    .when('GOOGLE_ENABLED_FOR_PIX_ADMIN', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  GOOGLE_REDIRECT_URI: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('GOOGLE_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() })
    .when('GOOGLE_ENABLED_FOR_PIX_ADMIN', { is: true, then: Joi.required(), otherwise: Joi.optional() }),

  // AUTHENTICATION SESSION CONFIGURATION
  AUTHENTICATION_SESSION_TEMPORARY_STORAGE_EXP_DELAY_SECONDS: Joi.number().optional().default(1140),

  // SESSIONS MASS IMPORT CONFIGURATION
  SESSIONS_MASS_IMPORT_TEMPORARY_STORAGE_EXP_DELAY_SECONDS: Joi.number().optional().default(7200),

  // TEMPORARY STORAGE
  TEMPORARY_STORAGE_EXPIRATION_DELAY_SECONDS: Joi.number().optional().default(600),

  // V3 CERTIFICATION
  DEFAULT_PROBABILITY_TO_PICK_CHALLENGE: Joi.number().optional().default(51),
  V3_CERTIFICATION_NUMBER_OF_CHALLENGES_PER_COURSE: Joi.number().optional().default(20),

  // MAX REACHABLE LEVEL
  MAX_REACHABLE_LEVEL: Joi.number().optional().default(5),

  // ENABLE REQUEST MONITORING
  ENABLE_REQUEST_MONITORING: Joi.boolean().optional().default(false),

  // ENABLE KNEX PERFORMANCE MONITORING
  ENABLE_KNEX_PERFORMANCE_MONITORING: Joi.boolean().optional().default(false),

  // FLASH METHOD CHALLENGES
  NUMBER_OF_CHALLENGES_FOR_FLASH_METHOD: Joi.number(),
  SUCCESS_PROBABILITY_THRESHOLD: Joi.number(),

  // TOKENS
  ACCESS_TOKEN_LIFESPAN: Joi.string().optional().default('20m'),
  ANONYMOUS_ACCESS_TOKEN_LIFESPAN: Joi.string().optional().default('4h'),
  CAMPAIGN_RESULT_ACCESS_TOKEN_LIFESPAN: Joi.string().optional().default('1h'),
  REFRESH_TOKEN_LIFESPAN: Joi.string().optional().default('7d'),
  SAML_ACCESS_TOKEN_LIFESPAN: Joi.string().optional().default('7d'),

  // TESTS
  TEST_LOG_ENABLED: Joi.boolean().optional().default(false),
  TEST_REDIS_URL: Joi.string()
    .uri({ scheme: ['redis'] })
    .when('NODE_ENV', { is: 'test', then: Joi.required(), otherwise: Joi.optional() }),

  // LOGIN
  LOGIN_BLOCKING_LIMIT_FAILURE_COUNT: Joi.number().optional().default(50),
  LOGIN_TEMPORARY_BLOCKING_BASE_TIME: Joi.string().optional().default('2m'),
  LOGIN_TEMPORARY_BLOCKING_THRESHOLD_FAILURE_COUNT: Joi.number().optional().default(10),

  // FEATURE TOGGLES
  FT_ALWAYS_OK_VALIDATE_NEXT_CHALLENGE_ENDPOINT: Joi.boolean().optional().default(false),
  FT_ENABLE_CERTIF_TOKEN_SCOPE: Joi.boolean().optional().default(false),
  FT_ENABLE_PIX_PLUS_LOWER_LEVEL: Joi.boolean().optional().default(false),
  FT_PIX_1D_ENABLED: Joi.boolean().optional().default(false),

  // CPF
  CPF_EXPORTS_STORAGE_ACCESS_KEY_ID: Joi.string().optional(),
  CPF_EXPORTS_STORAGE_BUCKET_NAME: Joi.string().optional().default('pix-cpf-dev'),
  CPF_EXPORTS_STORAGE_ENDPOINT: Joi.string()
    .uri({ scheme: ['https'] })
    .optional()
    .default('https://s3.gra.cloud.ovh.net'),
  CPF_EXPORTS_STORAGE_PRE_SIGNED_EXPIRES_IN: Joi.number().optional().default(604800),
  CPF_EXPORTS_STORAGE_REGION: Joi.string().optional().default('gra'),
  CPF_EXPORTS_STORAGE_SECRET_ACCESS_KEY: Joi.string().optional(),
  CPF_PLANNER_JOB_CHUNK_SIZE: Joi.number().optional().default(50000),
  CPF_PLANNER_JOB_CRON: Joi.string().optional().default('0 0 1 1 *'),
  CPF_PLANNER_JOB_MINIMUM_RELIABILITY_PERIOD: Joi.number().optional().default(3),
  CPF_PLANNER_JOB_MONTHS_TO_PROCESS: Joi.number().optional().default(1),
  CPF_RECEIPTS_STORAGE_ACCESS_KEY_ID: Joi.string().optional(),
  CPF_RECEIPTS_STORAGE_BUCKET_NAME: Joi.string().optional().default('pix-cpf-processing-receipts-dev'),
  CPF_RECEIPTS_STORAGE_ENDPOINT: Joi.string()
    .uri({ scheme: ['https'] })
    .optional()
    .default('https://s3.gra.cloud.ovh.net'),
  CPF_RECEIPTS_STORAGE_REGION: Joi.string().optional().default('gra'),
  CPF_RECEIPTS_STORAGE_SECRET_ACCESS_KEY: Joi.string().optional(),
  CPF_SEND_EMAIL_JOB_CRON: Joi.string().optional().default('0 0 1 1 *'),
  CPF_SEND_EMAIL_JOB_RECIPIENT: Joi.string().email().optional(),

  // DATA PROTECTION POLICY CONFIGURATION
  DATA_PROTECTION_POLICY_UPDATE_DATE: Joi.string().isoDate().optional(),

  // HTTP
  FETCH_TIMEOUT_MILLISECONDS: Joi.string().optional().default('20s'),

  // AUDIT LOGGER
  PIX_AUDIT_LOGGER_BASE_URL: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .when('PIX_AUDIT_LOGGER_ENABLED', { is: true, then: Joi.required(), otherwise: Joi.optional() }),
  PIX_AUDIT_LOGGER_CLIENT_SECRET: Joi.string().when('PIX_AUDIT_LOGGER_ENABLED', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  PIX_AUDIT_LOGGER_ENABLED: Joi.boolean().required().default(false),

  // AUTONOMOUS COURSES
  AUTONOMOUS_COURSES_ORGANIZATION_ID: Joi.number().required().default(9000000),

  // IMPORT S3 STORAGE
  IMPORT_STORAGE_ACCESS_KEY_ID: Joi.string().optional().allow(''),
  IMPORT_STORAGE_BUCKET_NAME: Joi.string().optional().default('pix-import-dev'),
  IMPORT_STORAGE_ENDPOINT: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .optional()
    .default('http://localhost:9090'),
  IMPORT_STORAGE_REGION: Joi.string().optional().default('pix'),
  IMPORT_STORAGE_SECRET_ACCESS_KEY: Joi.string().optional().allow(''),
  TEST_IMPORT_STORAGE_BUCKET_NAME: Joi.string().optional().default('pix-import-test'),
  TEST_IMPORT_STORAGE_ENDPOINT: Joi.string()
    .uri({ scheme: ['https', 'http'] })
    .optional()
    .default('http://localhost:9090'),
});
