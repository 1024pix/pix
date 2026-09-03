import * as url from 'node:url';

import dayjs from 'dayjs';
import ms from 'ms';

import Joi from './config-joi.js';

let isEnvLoaded = false;

// Load environment variables from .env files
if (!isEnvLoaded) {
  try {
    if (process.env.NODE_ENV === 'test') {
      process.loadEnvFile(url.fileURLToPath(new URL('../../tests/setup/.env.test', import.meta.url)));
    } else {
      process.loadEnvFile(url.fileURLToPath(new URL('../../.env', import.meta.url)));
    }
  } catch {
    // .env file not found, continuing without it
  } finally {
    // eslint-disable-next-line no-useless-assignment
    isEnvLoaded = true;
  }
}

function parseJSONEnv(varName) {
  if (process.env[varName]) {
    return JSON.parse(process.env[varName]);
  }
  return undefined;
}

function toBoolean(environmentVariable, defaultValue = false) {
  if (environmentVariable === undefined || environmentVariable === '') {
    return defaultValue;
  }
  return environmentVariable === 'true';
}

/**
 * @template T
 * @param {string=} numberAsString
 * @param {T} defaultValue
 */
function _getNumber(numberAsString, defaultValue) {
  const number = parseInt(numberAsString, 10);
  return isNaN(number) ? defaultValue : number;
}

function _getDate(dateAsString) {
  if (!dateAsString) {
    return null;
  }
  const dateAsMoment = dayjs(dateAsString);
  if (!dateAsMoment.isValid()) {
    return null;
  }

  return dateAsMoment.toDate();
}

function _removeTrailingSlashFromUrl(url) {
  return url.replace(/\/$/, '');
}

function _getLogForHumans() {
  const processOutputingToTerminal = process.stdout.isTTY;
  const forceJSONLogs = process.env.LOG_FOR_HUMANS === 'false';
  return processOutputingToTerminal && !forceJSONLogs;
}

// Can be useful for A/B testing, leaving it here
// while we think on how we can do better
// eslint-disable-next-line no-unused-vars
function isEnabledByContainerModulo(envVarValue) {
  const modulo = _getNumber(envVarValue, 0);
  if (modulo === 0) return false;

  const containerIndexString = process.env.CONTAINER?.split('-').at(-1);
  if (!containerIndexString) return false;

  const containerIndex = Number.parseInt(containerIndexString, 10);
  if (Number.isNaN(containerIndex)) return false;

  return containerIndex % modulo === 0;
}

function getSeedsConfig() {
  const context = buildSeedsContext(process.env.SEEDS_CONTEXT);

  const frameworks = process.env.SEEDS_LEARNING_CONTENT_FRAMEWORKS?.split(',') ?? ['Pix', 'Droit', 'Edu', 'Modulix'];
  if (context.junior && !frameworks.includes('Pix 1D')) {
    frameworks.push('Pix 1D');
  }

  return {
    context,
    learningContent: {
      frameworks,
      locales: process.env.SEEDS_LEARNING_CONTENT_LOCALES?.split(',') ?? ['fr-fr', 'en', 'nl', 'nl-BE'],
    },
  };
}

const SEEDS_CONTEXTS = [
  'prescription',
  'devcomp',
  'junior',
  'acces',
  'contenu',
  'certification',
  'evaluation',
  'acquisition',
];

function buildSeedsContext(value) {
  const values = value && value.length ? value.toLowerCase().split('|') : SEEDS_CONTEXTS;
  return Object.fromEntries(Array.from(SEEDS_CONTEXTS, (v) => [v, values.includes(v)]));
}

export const schema = Joi.object({
  MADDO: Joi.boolean().optional().default(false),
  ACCESS_TOKEN_LIFESPAN: Joi.string().optional(),
  // only the answers historization job needs those two ANSWERS_HISTORY values, hence optional here: the job itself
  // rejects a missing or non-positive value rather than silently skipping its batching
  ANSWERS_HISTORY_ASSESSMENT_ID_RANGE: Joi.number().integer().min(1).optional(),
  ANSWERS_HISTORY_ANSWER_BATCH_SIZE: Joi.number().integer().min(1).optional(),
  AUTH_SECRET: Joi.string().required(),
  AUTONOMOUS_COURSES_ORGANIZATION_ID: Joi.number().requiredForApi(),
  API_DATA_URL: Joi.string().uri().optional(),
  API_DATA_USERNAME: Joi.string().optional(),
  API_DATA_PASSWORD: Joi.string().optional(),
  API_DATA_QUERIES: Joi.string().optional(),
  BASE_URL: Joi.string().optional(),
  BREVO_ACCOUNT_CREATION_TEMPLATE_ID: Joi.number().optional(),
  BREVO_API_KEY: Joi.string().optional(),
  BREVO_ORGANIZATION_INVITATION_SCO_TEMPLATE_ID: Joi.number().optional(),
  BREVO_ORGANIZATION_INVITATION_TEMPLATE_ID: Joi.number().optional(),
  BREVO_PASSWORD_RESET_TEMPLATE_ID: Joi.number().optional(),
  BREVO_SELF_ACCOUNT_DELETION_TEMPLATE_ID: Joi.number().optional(),
  CONTAINER_VERSION: Joi.string().optional(),
  CPF_EXPORTS_STORAGE_ACCESS_KEY_ID: Joi.string().optional(),
  CPF_EXPORTS_STORAGE_BUCKET_NAME: Joi.string().optional(),
  CPF_EXPORTS_STORAGE_ENDPOINT: Joi.string().optional(),
  CPF_EXPORTS_STORAGE_PRE_SIGNED_EXPIRES_IN: Joi.number().optional(),
  CPF_EXPORTS_STORAGE_REGION: Joi.string().optional(),
  CPF_EXPORTS_STORAGE_SECRET_ACCESS_KEY: Joi.string().optional(),
  CPF_PLANNER_JOB_CHUNK_SIZE: Joi.number().optional(),
  CPF_PLANNER_JOB_CRON: Joi.string().optional(),
  CPF_PLANNER_JOB_MINIMUM_RELIABILITY_PERIOD: Joi.number().optional(),
  CPF_PLANNER_JOB_MONTHS_TO_PROCESS: Joi.number().optional(),
  CPF_SEND_EMAIL_JOB_CRON: Joi.string().optional(),
  CPF_SEND_EMAIL_JOB_RECIPIENT: Joi.string().optional(),
  DATABASE_CONNECTION_POOL_MAX_SIZE: Joi.number().integer().min(0).optional(),
  DATABASE_CONNECTION_POOL_MIN_SIZE: Joi.number().integer().min(0).optional(),
  DATABASE_URL: Joi.string().uri().required(),
  DATAMART_DATABASE_URL: Joi.string().uri().required(),
  DATAWAREHOUSE_DATABASE_URL: Joi.string().uri().requiredForMaddo(),
  JOBS_DATABASE_URL: Joi.string().uri().required(),
  DOMAIN_PIX: Joi.string().optional(),
  DOMAIN_PIX_APP: Joi.string().optional(),
  DOMAIN_PIX_ORGA: Joi.string().optional(),
  EMAIL_VALIDATION_DEMAND_TEMPORARY_STORAGE_LIFESPAN: Joi.string().optional().default('3d'),
  ENABLE_KNEX_PERFORMANCE_MONITORING: Joi.string().optional().valid('true', 'false'),
  FT_ALWAYS_OK_VALIDATE_NEXT_CHALLENGE: Joi.string().optional().valid('true', 'false'),
  FT_ENABLE_TEXT_TO_SPEECH_BUTTON: Joi.string().optional().valid('true', 'false'),
  KNEX_ASYNC_STACKTRACE_ENABLED: Joi.string().optional().valid('true', 'false'),
  LCMS_API_KEY: Joi.string().requiredForApi(),
  LCMS_API_OAUTH_BASIC_TOKEN: Joi.string(),
  LCMS_API_URL: Joi.string().uri().requiredForApi(),
  LCMS_API_RELEASE_ID: Joi.any(),
  LLM_CHAT_TEMPORARY_STORAGE_EXP_DELAY_SECONDS: Joi.string().optional(),
  LLM_CONFIGURATION_EDITOR_API_FETCH_CONNECTION_TIMEOUT_MS: Joi.number().min(0).optional(),
  LLM_CONFIGURATION_EDITOR_API_GET_CONFIGURATION_URL: Joi.string().optional(),
  LLM_CONFIGURATION_EDITOR_API_JWT_SECRET: Joi.string().optional(),
  LLM_INFERENCE_API_POST_PROMPT_URL: Joi.string().optional(),
  LLM_INFERENCE_API_JWT_SECRET: Joi.string().optional(),
  LLM_DELETE_CHATS_JOB_LIFESPAN: Joi.number().min(0).optional(),
  LLM_DELETE_CHATS_JOB_DRY_RUN: Joi.string().optional().valid('true', 'false'),
  LLM_DELETE_CHATS_JOB_CRON: Joi.string().optional(),
  LLM_DELETE_CHATS_JOB_MS_BETWEEN_CHUNKS: Joi.number().min(0).optional(),
  LOG_ENABLED: Joi.string().required().valid('true', 'false'),
  OTEL_ENABLED: Joi.string().optional().valid('true', 'false').default('false'),
  LOG_FOR_HUMANS: Joi.string().optional().valid('true', 'false'),
  LOG_LEVEL: Joi.string().optional().valid('silent', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'),
  LOG_OPS_METRICS: Joi.string().optional().valid('true', 'false'),
  MAILING_ENABLED: Joi.string().optional().valid('true', 'false'),
  MAILING_PROVIDER: Joi.string().optional().valid('brevo', 'mailpit'),
  DEVCOMP_MODULE_JSON_SCHEMA_CACHE_MAX_AGE: Joi.number().optional(),
  NODE_ENV: Joi.string().optional().valid('development', 'test', 'production'),
  PGBOSS_STATES_MONITORING_JOB_CRON: Joi.string().optional(),
  POLE_EMPLOI_CLIENT_ID: Joi.string().optional(),
  POLE_EMPLOI_CLIENT_SECRET: Joi.string().optional(),
  REDIS_URL: Joi.string().uri().optional(),
  REVOKED_USER_ACCESS_LIFESPAN: Joi.string().optional(),
  SCO_ACCOUNT_RECOVERY_KEY_LIFETIME_MINUTES: Joi.number().integer().min(1).optional(),
  TLD_FR: Joi.string().optional(),
  TLD_ORG: Joi.string().optional(),
  APIM_URL: Joi.string().optional(),
  PIX_ASSETS_MANAGER_URL: Joi.string().uri().optional(),
  HTTP_SERVER_RESPONSE_TIMEOUT_MS: Joi.number().integer().min(0).optional(),
  ROUTE_DOMAIN_TO_OWNER_TEAM_MAPPING: Joi.string().optional(),
}).options({ allowUnknown: true });

export const config = {
  database: {
    liveUrl: process.env.DATABASE_URL,
    pgbouncerUrl: process.env.PGBOUNCER_DATABASE_URL,
    datamartUrl: process.env.DATAMART_DATABASE_URL,
    datawarehouseUrl: process.env.DATAWAREHOUSE_DATABASE_URL,
    jobsUrl: process.env.JOBS_DATABASE_URL,
    connection: {
      statementTimeout: _getNumber(process.env.DATABASE_STATEMENT_TIMEOUT_MS),
      queryTimeout: _getNumber(process.env.DATABASE_QUERY_TIMEOUT_MS),
      idleInTransactionSessionTimeout: _getNumber(process.env.DATABASE_IDLE_IN_TRANSACTION_SESSION_TIMEOUT_MS),
      connectionTimeoutMillis: _getNumber(process.env.DATABASE_CONNECTION_TIMEOUT_MS),
    },
    pool: {
      min: _getNumber(process.env.DATABASE_CONNECTION_POOL_MIN_SIZE),
      max: _getNumber(process.env.DATABASE_CONNECTION_POOL_MAX_SIZE),
      idleTimeoutMillis: _getNumber(process.env.DATABASE_IDLE_TIMEOUT_MS, 10_000),
    },
  },

  answersHistoryExport: {
    storage: {
      client: {
        accessKeyId: process.env.ANSWERS_HISTORY_EXPORT_STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.ANSWERS_HISTORY_EXPORT_STORAGE_SECRET_ACCESS_KEY,
        endpoint: process.env.ANSWERS_HISTORY_EXPORT_STORAGE_ENDPOINT,
        region: process.env.ANSWERS_HISTORY_EXPORT_STORAGE_REGION,
        bucket: process.env.ANSWERS_HISTORY_EXPORT_STORAGE_BUCKET_NAME,
        forcePathStyle: true,
      },
      assessmentIdRange: parseInt(process.env.ANSWERS_HISTORY_ASSESSMENT_ID_RANGE),
      assessmentIdBatchSize: parseInt(process.env.ANSWERS_HISTORY_ASSESSMENT_ID_BATCH_SIZE),
      answerBatchSize: parseInt(process.env.ANSWERS_HISTORY_ANSWER_BATCH_SIZE),
    },
  },
  import: {
    storage: {
      client: {
        accessKeyId: process.env.IMPORT_STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.IMPORT_STORAGE_SECRET_ACCESS_KEY,
        endpoint: process.env.IMPORT_STORAGE_ENDPOINT,
        region: process.env.IMPORT_STORAGE_REGION,
        bucket: process.env.IMPORT_STORAGE_BUCKET_NAME,
        forcePathStyle: true,
      },
    },
  },
  anonymous: {
    accessTokenLifespanMs: ms(process.env.ANONYMOUS_ACCESS_TOKEN_LIFESPAN || '4h'),
  },
  apiData: {
    url: process.env.API_DATA_URL,
    credentials: {
      username: process.env.API_DATA_USERNAME,
      password: process.env.API_DATA_PASSWORD,
    },
    queries: parseJSONEnv('API_DATA_QUERIES'),
  },
  apiManager: {
    url: process.env.APIM_URL || 'https://gateway.pix.fr',
  },
  assetsManager: {
    url: process.env.PIX_ASSETS_MANAGER_URL,
  },
  attestations: {
    storage: {
      client: {
        accessKeyId: process.env.ATTESTATIONS_STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.ATTESTATIONS_STORAGE_SECRET_ACCESS_KEY,
        endpoint: process.env.ATTESTATIONS_STORAGE_ENDPOINT,
        region: process.env.ATTESTATIONS_STORAGE_REGION,
        bucket: process.env.ATTESTATIONS_STORAGE_BUCKET_NAME,
        forcePathStyle: true,
      },
    },
  },
  auditLogger: {
    baseUrl: process.env.PIX_AUDIT_LOGGER_BASE_URL,
    clientSecret: process.env.PIX_AUDIT_LOGGER_CLIENT_SECRET,
  },
  authentication: {
    secret: process.env.AUTH_SECRET,
    accessTokenLifespanMs: ms(process.env.ACCESS_TOKEN_LIFESPAN || '20m'),
    refreshTokenLifespanMs: ms(process.env.REFRESH_TOKEN_LIFESPAN || '7d'),
    revokedUserAccessLifespanMs: ms(process.env.REVOKED_USER_ACCESS_LIFESPAN || '7d'),
    tokenForStudentReconciliationLifespan: '1h',
    passwordResetTokenLifespan: process.env.PASSWORD_RESET_TOKEN_LIFESPAN || '1h',
    permitPixAdminLoginFromPassword: toBoolean(process.env.PIX_ADMIN_LOGIN_FROM_PASSWORD_ENABLED),
  },
  authenticationSession: {
    temporaryStorage: {
      expirationDelaySeconds:
        parseInt(process.env.AUTHENTICATION_SESSION_TEMPORARY_STORAGE_EXP_DELAY_SECONDS, 10) || 1140,
    },
  },
  availableCharacterForCode: {
    letters: 'BCDFGHJKMPQRTVWXY',
    numbers: '2346789',
  },
  // Variable d'environnement temporaire pour LTI en attendant la mise à place d'une gateway
  // Ne pas utiliser pour d'autres usages
  baseUrl: process.env.BASE_URL ?? 'https://api.pix.fr',
  bcryptNumberOfSaltRounds: _getNumber(process.env.BCRYPT_NUMBER_OF_SALT_ROUNDS, 10),
  caching: {
    redisUrl: process.env.REDIS_URL,
    redisCacheKeyLockTTL: parseInt(process.env.REDIS_CACHE_KEY_LOCK_TTL, 10) || 60000,
    redisCacheLockedWaitBeforeRetry: parseInt(process.env.REDIS_CACHE_LOCKED_WAIT_BEFORE_RETRY, 10) || 1000,
  },
  cpf: {
    idClient: '03VML243',
    idContrat: 'MCFCER000209',
    codeFranceConnect: 'RS5875',
    storage: {
      cpfExports: {
        client: {
          accessKeyId: process.env.CPF_EXPORTS_STORAGE_ACCESS_KEY_ID,
          secretAccessKey: process.env.CPF_EXPORTS_STORAGE_SECRET_ACCESS_KEY,
          endpoint: process.env.CPF_EXPORTS_STORAGE_ENDPOINT,
          region: process.env.CPF_EXPORTS_STORAGE_REGION,
          bucket: process.env.CPF_EXPORTS_STORAGE_BUCKET_NAME,
        },
        commands: {
          preSignedExpiresIn: process.env.CPF_EXPORTS_STORAGE_PRE_SIGNED_EXPIRES_IN || 604800,
        },
      },
    },
    plannerJob: {
      chunkSize: process.env.CPF_PLANNER_JOB_CHUNK_SIZE || 50000,
      monthsToProcess: _getNumber(process.env.CPF_PLANNER_JOB_MONTHS_TO_PROCESS, 1),
      minimumReliabilityPeriod: _getNumber(process.env.CPF_PLANNER_JOB_MINIMUM_RELIABILITY_PERIOD, 3),
      cron: process.env.CPF_PLANNER_JOB_CRON || '0 0 1 1 *',
    },
    sendEmailJob: {
      recipient: process.env.CPF_SEND_EMAIL_JOB_RECIPIENT,
      cron: process.env.CPF_SEND_EMAIL_JOB_CRON || '0 0 1 1 *',
    },
  },
  dataProtectionPolicy: {
    updateDate: process.env.DATA_PROTECTION_POLICY_UPDATE_DATE || null,
  },
  domain: {
    tldFr: process.env.TLD_FR || '.fr',
    tldOrg: process.env.TLD_ORG || '.org',
    pix: process.env.DOMAIN_PIX || 'https://pix',
    pixApp: process.env.DOMAIN_PIX_APP || 'https://app.pix',
    pixOrga: process.env.DOMAIN_PIX_ORGA || 'https://orga.pix',
    pixCertif: process.env.DOMAIN_PIX_CERTIF || 'https://certif.pix',
  },
  environment: process.env.NODE_ENV || 'development',
  features: {
    dayBeforeImproving: _getNumber(process.env.DAY_BEFORE_IMPROVING, 4),
    dayBeforeCompetenceResetV2: _getNumber(process.env.DAY_BEFORE_COMPETENCE_RESET_V2, 7),
    garAccessV2: toBoolean(process.env.GAR_ACCESS_V2),
    maxReachableLevel: _getNumber(process.env.MAX_REACHABLE_LEVEL, 5),
    newYearOrganizationLearnersImportDate: _getDate(process.env.NEW_YEAR_ORGANIZATION_LEARNERS_IMPORT_DATE),
    successProbabilityThreshold: parseFloat(process.env.SUCCESS_PROBABILITY_THRESHOLD ?? '0.95'),
    scheduleComputeOrganizationLearnersCertificability: {
      cron: process.env.SCHEDULE_COMPUTE_LEARNERS_CERTIFICABILITY_JOB_CRON || '0 21 * * *',
      chunkSize: process.env.SCHEDULE_COMPUTE_LEARNERS_CERTIFICABILITY_CHUNK_SIZE || 1000,
      synchronously: toBoolean(process.env.SCHEDULE_COMPUTE_LEARNERS_CERTIFICABILITY_SYNCHRONOUSLY),
    },
    scoAccountRecoveryKeyLifetimeMinutes: process.env.SCO_ACCOUNT_RECOVERY_KEY_LIFETIME_MINUTES,
    organizationPlacesManagementThreshold: parseFloat(process.env.ORGANIZATION_PLACES_MANAGEMENT_THRESHOLD ?? '0.1'),
    databaseHistory: {
      scheduleHistorizeAnswers: {
        cron: process.env.SCHEDULE_HISTORIZE_ANSWERS_JOB_CRON || '0 0 29 2 *',
      },
    },
  },
  featureToggles: {
    deprecatePoleEmploiPushNotification: toBoolean(process.env.DEPRECATE_PE_PUSH_NOTIFICATION),
    isAlwaysOkValidateNextChallengeEndpointEnabled: toBoolean(
      process.env.FT_ALWAYS_OK_VALIDATE_NEXT_CHALLENGE_ENDPOINT,
    ),
  },
  hapi: {
    options: {},
  },
  infra: {
    appName: process.env.APP,
    containerName: process.env.CONTAINER,
    hostname: process.env.HOSTNAME || 'pix-api',
    isReviewApp: toBoolean(process.env.REVIEW_APP),
    concurrencyForHeavyOperations: _getNumber(process.env.INFRA_CONCURRENCY_HEAVY_OPERATIONS, 2),
    chunkSizeForCampaignResultProcessing: _getNumber(process.env.INFRA_CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING, 10),
    chunkSizeForOrganizationLearnerDataProcessing: _getNumber(
      process.env.INFRA_CHUNK_SIZE_ORGANIZATION_LEARNER_DATA_PROCESSING,
      1000,
    ),
    engineeringUserId: _getNumber(process.env.ENGINEERING_USER_ID),
    startJobInWebProcess: toBoolean(process.env.START_JOB_IN_WEB_PROCESS),
  },
  jwtConfig: {
    certificationResults: {
      scope: process.env.CERTIFICATION_RESULTS_JWT_SCOPE || 'certificationResultsLink',
      tokenLifespan: process.env.CERTIFICATION_RESULTS_JWT_TOKEN_LIFE_SPAN || '30d',
    },
  },
  lcms: {
    url: _removeTrailingSlashFromUrl(
      (process.env.IS_RUNNING_PLAYWRIGHT === 'true' && process.env.PLAYWRIGHT_LCMS_API_URL) ||
        process.env.CYPRESS_LCMS_API_URL ||
        process.env.LCMS_API_URL ||
        '',
    ),
    apiKey:
      (process.env.IS_RUNNING_PLAYWRIGHT === 'true' && process.env.PLAYWRIGHT_LCMS_API_KEY) ||
      process.env.CYPRESS_LCMS_API_KEY ||
      process.env.LCMS_API_KEY,
    oauthBasicToken: process.env.LCMS_API_OAUTH_BASIC_TOKEN,
    releaseId: process.env.LCMS_API_RELEASE_ID || null,
  },
  llm: {
    temporaryStorage: {
      expirationDelaySeconds: ms(process.env.LLM_CHAT_TEMPORARY_STORAGE_EXP_DELAY_SECONDS ?? '12h'),
    },
    lockChatExpirationDelayMilliseconds: (process.env.LLM_LOCK_CHAT_EXPIRATION_DELAY_SECONDS ?? 200) * 1000,
    inferenceApi: {
      postPromptUrl: _removeTrailingSlashFromUrl(process.env.LLM_INFERENCE_API_POST_PROMPT_URL ?? ''),
      authSecret: process.env.LLM_INFERENCE_API_JWT_SECRET,
    },
    configurationEditorApi: {
      getConfigurationUrl: _removeTrailingSlashFromUrl(
        process.env.LLM_CONFIGURATION_EDITOR_API_GET_CONFIGURATION_URL ?? '',
      ),
      authSecret: process.env.LLM_CONFIGURATION_EDITOR_API_JWT_SECRET,
      fetchConnectionTimeoutMs: _getNumber(
        process.env.LLM_CONFIGURATION_EDITOR_API_FETCH_CONNECTION_TIMEOUT_MS,
        12_000,
      ),
    },
    deleteChatsJob: {
      lifespan: _getNumber(process.env.LLM_DELETE_CHATS_JOB_LIFESPAN, 80),
      cron: process.env.LLM_DELETE_CHATS_JOB_CRON || '0 19 * * *',
      dryRun: toBoolean(process.env.LLM_DELETE_CHATS_JOB_DRY_RUN, true),
      chunkSize: _getNumber(process.env.LLM_DELETE_CHATS_JOB_CHUNK_SIZE, 3_333),
      msBetweenChunks: _getNumber(process.env.LLM_DELETE_CHATS_JOB_MS_BETWEEN_CHUNKS, 10),
    },
  },
  logging: {
    enabled: toBoolean(process.env.LOG_ENABLED),
    otelEnabled: toBoolean(process.env.OTEL_ENABLED),
    logLevel: process.env.LOG_LEVEL || 'info',
    logForHumans: _getLogForHumans(),
    logForHumansCompactFormat: process.env.LOG_FOR_HUMANS_FORMAT === 'compact',
    enableKnexPerformanceMonitoring: toBoolean(process.env.ENABLE_KNEX_PERFORMANCE_MONITORING),
    enableLogStartingEventDispatch: toBoolean(process.env.LOG_STARTING_EVENT_DISPATCH),
    enableLogEndingEventDispatch: toBoolean(process.env.LOG_ENDING_EVENT_DISPATCH),
    opsEventIntervalInSeconds: process.env.OPS_EVENT_INTERVAL_IN_SECONDS || 15,
    debugSections: process.env.LOG_DEBUG?.split(',') ?? [],
    certificationVerificationCodeLogHashSecret: process.env.CERTIFICATION_VERIFICATION_CODE_LOG_HASH_SECRET || 'local',
  },
  login: {
    temporaryBlockingThresholdFailureCount: _getNumber(
      process.env.LOGIN_TEMPORARY_BLOCKING_THRESHOLD_FAILURE_COUNT || 10,
    ),
    temporaryBlockingBaseTimeMs: ms(process.env.LOGIN_TEMPORARY_BLOCKING_BASE_TIME || '2m'),
    blockingLimitFailureCount: _getNumber(process.env.LOGIN_BLOCKING_LIMIT_FAILURE_COUNT || 30),
    emailConnectionWarningPeriod: ms(process.env.EMAIL_CONNECTION_WARNING_PERIOD || '1y'),
  },
  logOpsMetrics: toBoolean(process.env.LOG_OPS_METRICS),
  lti: {
    authorizedPlatforms: process.env.LTI_AUTHORIZED_PLATFORMS?.split(',') ?? [],
    jwkModulusLength: _getNumber(process.env.LTI_JWK_MODULUS_LENGTH, 4096),
  },
  mailing: {
    enabled: toBoolean(process.env.MAILING_ENABLED),
    provider: process.env.MAILING_PROVIDER || 'mailpit',
    smtpUrl: process.env.MAILING_SMTP_URL || 'smtp://username:password@localhost:1025/',
    mailpit: {
      templates: {},
    },
    brevo: {
      apiKey: process.env.BREVO_API_KEY,
      templates: {
        accountCreationTemplateId: process.env.BREVO_ACCOUNT_CREATION_TEMPLATE_ID,
        accountRecoveryTemplateId: process.env.BREVO_ACCOUNT_RECOVERY_TEMPLATE_ID,
        acquiredCleaResultTemplateId: process.env.BREVO_CLEA_ACQUIRED_RESULT_TEMPLATE_ID,
        certificationCenterInvitationTemplateId: process.env.BREVO_CERTIFICATION_CENTER_INVITATION_TEMPLATE_ID,
        certificationResultTemplateId: process.env.BREVO_CERTIFICATION_RESULT_TEMPLATE_ID,
        cpfEmailTemplateId: process.env.BREVO_CPF_TEMPLATE_ID,
        emailVerificationCodeTemplateId: process.env.BREVO_EMAIL_VERIFICATION_CODE_TEMPLATE_ID,
        organizationInvitationTemplateId: process.env.BREVO_ORGANIZATION_INVITATION_TEMPLATE_ID,
        organizationInvitationScoTemplateId: process.env.BREVO_ORGANIZATION_INVITATION_SCO_TEMPLATE_ID,
        passwordResetTemplateId: process.env.BREVO_PASSWORD_RESET_TEMPLATE_ID,
        selfAccountDeletionTemplateId: process.env.BREVO_SELF_ACCOUNT_DELETION_TEMPLATE_ID,
        targetProfileNotCertifiableTemplateId: process.env.BREVO_TARGET_PROFILE_NOT_CERTIFIABLE_TEMPLATE_ID,
        warningConnectionTemplateId: process.env.BREVO_WARNING_CONNECTION_TEMPLATE_ID,
      },
    },
  },
  metrics: {
    prometheus: {
      enabled: toBoolean(process.env.PROMETHEUS_ENABLED),
      prefix: process.env.PROMETHEUS_PREFIX ?? 'pix_api',
      pushgateway: {
        pushInterval: ms(process.env.PROMETHEUS_PUSHGATEWAY_PUSH_INTERVAL ?? '15s'),
        url: process.env.PROMETHEUS_PUSHGATEWAY_URL,
        basicAuth: process.env.PROMETHEUS_PUSHGATEWAY_BASIC_AUTH,
        timeout: ms(process.env.PROMETHEUS_PUSHGATEWAY_TIMEOUT ?? '5s'),
        keepAliveMsec: ms(process.env.PROMETHEUS_PUSHGATEWAY_KEEP_ALIVE ?? '1s'),
      },
      buckets: Object.assign(
        {
          lc_read: [10, 100, 1000],
          lc_cachemiss: [10, 100, 1000],
          lc_cachepenalty: [0.001, 0.01, 0.1],
        },
        parseJSONEnv('PROMETHEUS_METRICS_BUCKETS'),
      ),
    },
    isOppsyDisabled: toBoolean(process.env.FT_OPPSY_DISABLED),
  },
  module: {
    secret: process.env.REDIRECTION_URL_SECRET,
    jsonSchemaCacheMaxAge: _getNumber(process.env.DEVCOMP_MODULE_JSON_SCHEMA_CACHE_MAX_AGE, 900),
  },
  mutex: {
    redisUrl: process.env.REDIS_URL,
  },
  partner: {
    fetchTimeOut: ms(process.env.FETCH_TIMEOUT_MILLISECONDS || '20s'),
  },
  pgBoss: {
    clientConnexionPoolMaxSize: _getNumber(process.env.PGBOSS_CLIENT_CONNECTION_POOL_MAX_SIZE, 2),
    workerConnexionPoolMaxSize: _getNumber(process.env.PGBOSS_WORKER_CONNECTION_POOL_MAX_SIZE, 15),
    localConcurrency: _getNumber(process.env.PGBOSS_LOCAL_CONCURRENCY, 1),
    retentionSeconds: _getNumber(process.env.PGBOSS_RETENTION_SECONDS, 30 * 24 * 3600),
    persistWarnings: toBoolean(process.env.PGBOSS_PERSIST_WARNINGS, false),
    useListenNotify: toBoolean(process.env.PGBOSS_USE_LISTEN_NOTIFY, true),
    statesMonitoringJobCron: process.env.PGBOSS_STATES_MONITORING_JOB_CRON || '* * * * *',
    validationFileJobEnabled: toBoolean(process.env.PGBOSS_VALIDATION_FILE_JOB_ENABLED, true),
    importFileJobEnabled: toBoolean(process.env.PGBOSS_IMPORT_FILE_JOB_ENABLED, true),
    plannerJobEnabled: toBoolean(process.env.PGBOSS_PLANNER_JOB_ENABLED, true),
    exportSenderJobEnabled: toBoolean(process.env.PGBOSS_EXPORT_SENDER_JOB_ENABLED, true),
    updateCombinedCourseJobEnabled: toBoolean(process.env.PGBOSS_UPDATE_COMBINED_COURSE_JOB_ENABLED, true),
    computeCertificabilityJobEnabled: toBoolean(process.env.PGBOSS_COMPUTE_CERTIFICABILITY_JOB_ENABLED, true),
  },
  poleEmploi: {
    clientId: process.env.POLE_EMPLOI_CLIENT_ID,
    clientSecret: process.env.POLE_EMPLOI_CLIENT_SECRET,
    poleEmploiSendingsLimit: _getNumber(process.env.POLE_EMPLOI_SENDING_LIMIT, 100),
  },
  port: parseInt(process.env.PORT, 10) || 3000,
  saml: {
    spConfig: parseJSONEnv('SAML_SP_CONFIG'),
    idpConfig: parseJSONEnv('SAML_IDP_CONFIG'),
    attributeMapping: parseJSONEnv('SAML_ATTRIBUTE_MAPPING') || {
      samlId: 'IDO',
      firstName: 'PRE',
      lastName: 'NOM',
    },
    accessTokenLifespanMs: ms(process.env.SAML_ACCESS_TOKEN_LIFESPAN || '7d'),
  },
  seeds: getSeedsConfig(),
  passwordResetDemand: {
    secret: process.env.AUTH_SECRET,
    lifespan: process.env.PASSWORD_RESET_DEMAND_LIFESPAN || '1h',
  },
  temporarySessionsStorageForMassImport: {
    expirationDelaySeconds: parseInt(process.env.SESSIONS_MASS_IMPORT_TEMPORARY_STORAGE_EXP_DELAY_SECONDS, 10) || 7200,
  },
  temporaryStorage: {
    expirationDelaySeconds: parseInt(process.env.TEMPORARY_STORAGE_EXPIRATION_DELAY_SECONDS, 10) || 600,
    redisUrl: process.env.REDIS_URL,
  },
  temporaryStorageForEmailValidationDemands: {
    expirationDelaySeconds: ms(process.env.EMAIL_VALIDATION_DEMAND_TEMPORARY_STORAGE_LIFESPAN || '3d') / 1000,
  },
  temporaryStorageForEmailValidationCode: {
    expirationDelaySeconds: ms(process.env.EMAIL_VALIDATION_CODE_LIFESPAN || '1h') / 1000,
  },
  timeouts: {
    server: parseInt(process.env.HTTP_SERVER_RESPONSE_TIMEOUT_MS, 10) || 0,
  },
  version: process.env.CONTAINER_VERSION || 'development',
  autonomousCourse: {
    autonomousCoursesOrganizationId: parseInt(process.env.AUTONOMOUS_COURSES_ORGANIZATION_ID, 10) || 0,
  },
  routeDomainToOwnerTeamMapping: parseJSONEnv('ROUTE_DOMAIN_TO_OWNER_TEAM_MAPPING'),
  translations: {
    deeplApiKey: process.env.DEEPL_API_KEY,
  },
};
