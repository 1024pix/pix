import 'dotenv/config';

import path from 'node:path';
import * as url from 'node:url';

import dayjs from 'dayjs';
import ms from 'ms';

import Joi from './config-joi.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function parseJSONEnv(varName) {
  if (process.env[varName]) {
    return JSON.parse(process.env[varName]);
  }
  return undefined;
}

function toBoolean(environmentVariable) {
  return environmentVariable === 'true';
}

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
      locales: process.env.SEEDS_LEARNING_CONTENT_LOCALES?.split(',') ?? ['fr-fr', 'en'],
    },
  };
}

const SEEDS_CONTEXTS = ['prescription', 'devcomp', 'junior', 'acces', 'contenu', 'certification', 'evaluation'];

function buildSeedsContext(value) {
  const values = value && value.length ? value.toLowerCase().split('|') : SEEDS_CONTEXTS;
  return Object.fromEntries(Array.from(SEEDS_CONTEXTS, (v) => [v, values.includes(v)]));
}

const schema = Joi.object({
  MADDO: Joi.boolean().optional().default(false),
  ACCESS_TOKEN_LIFESPAN: Joi.string().optional(),
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
  CPF_RECEIPTS_STORAGE_ACCESS_KEY_ID: Joi.string().optional(),
  CPF_RECEIPTS_STORAGE_BUCKET_NAME: Joi.string().optional(),
  CPF_RECEIPTS_STORAGE_ENDPOINT: Joi.string().optional(),
  CPF_RECEIPTS_STORAGE_REGION: Joi.string().optional(),
  CPF_RECEIPTS_STORAGE_SECRET_ACCESS_KEY: Joi.string().optional(),
  CPF_SEND_EMAIL_JOB_CRON: Joi.string().optional(),
  CPF_SEND_EMAIL_JOB_RECIPIENT: Joi.string().optional(),
  DATABASE_CONNECTION_POOL_MAX_SIZE: Joi.number().integer().min(0).optional(),
  DATABASE_CONNECTION_POOL_MIN_SIZE: Joi.number().integer().min(0).optional(),
  DATABASE_URL: Joi.string().uri().required(),
  DATAMART_DATABASE_URL: Joi.string().uri().required(),
  DATAWAREHOUSE_DATABASE_URL: Joi.string().uri().requiredForMaddo(),
  DOMAIN_PIX: Joi.string().optional(),
  DOMAIN_PIX_APP: Joi.string().optional(),
  DOMAIN_PIX_ORGA: Joi.string().optional(),
  EMAIL_VALIDATION_DEMAND_TEMPORARY_STORAGE_LIFESPAN: Joi.string().optional().default('3d'),
  ENABLE_KNEX_PERFORMANCE_MONITORING: Joi.string().optional().valid('true', 'false'),
  FORCE_DROP_DATABASE: Joi.string().optional().valid('true', 'false'),
  FT_ALWAYS_OK_VALIDATE_NEXT_CHALLENGE: Joi.string().optional().valid('true', 'false'),
  FT_ENABLE_TEXT_TO_SPEECH_BUTTON: Joi.string().optional().valid('true', 'false'),
  KNEX_ASYNC_STACKTRACE_ENABLED: Joi.string().optional().valid('true', 'false'),
  LCMS_API_KEY: Joi.string().requiredForApi(),
  LCMS_API_URL: Joi.string().uri().requiredForApi(),
  LLM_API_GET_CONFIGURATIONS_URL: Joi.string().optional(),
  LLM_CHAT_TEMPORARY_STORAGE_EXP_DELAY_SECONDS: Joi.string().optional(),
  LOG_ENABLED: Joi.string().required().valid('true', 'false'),
  LOG_FOR_HUMANS: Joi.string().optional().valid('true', 'false'),
  LOG_LEVEL: Joi.string().optional().valid('silent', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'),
  LOG_OPS_METRICS: Joi.string().optional().valid('true', 'false'),
  MAILING_ENABLED: Joi.string().optional().valid('true', 'false'),
  MAILING_PROVIDER: Joi.string().optional().valid('brevo', 'mailpit'),
  NODE_ENV: Joi.string().optional().valid('development', 'test', 'production'),
  POLE_EMPLOI_CLIENT_ID: Joi.string().optional(),
  POLE_EMPLOI_CLIENT_SECRET: Joi.string().optional(),
  POLE_EMPLOI_SENDING_URL: Joi.string().uri().optional(),
  POLE_EMPLOI_TOKEN_URL: Joi.string().uri().optional(),
  REDIS_URL: Joi.string().uri().optional(),
  REVOKED_USER_ACCESS_LIFESPAN: Joi.string().optional(),
  SCO_ACCOUNT_RECOVERY_KEY_LIFETIME_MINUTES: Joi.number().integer().min(1).optional(),
  TEST_DATABASE_URL: Joi.string().optional(),
  TEST_LOG_ENABLED: Joi.string().optional().valid('true', 'false'),
  TEST_REDIS_URL: Joi.string().optional(),
  TLD_FR: Joi.string().optional(),
  TLD_ORG: Joi.string().optional(),
  APIM_URL: Joi.string().optional(),
}).options({ allowUnknown: true });

const configuration = (function () {
  const config = {
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
    account: {
      passwordValidationPattern: '^(?=.*\\p{Lu})(?=.*\\p{Ll})(?=.*\\d).{8,}$',
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
    auditLogger: {
      isEnabled: toBoolean(process.env.PIX_AUDIT_LOGGER_ENABLED),
      baseUrl: process.env.PIX_AUDIT_LOGGER_BASE_URL,
      clientSecret: process.env.PIX_AUDIT_LOGGER_CLIENT_SECRET,
    },
    authentication: {
      secret: process.env.AUTH_SECRET,
      accessTokenLifespanMs: ms(process.env.ACCESS_TOKEN_LIFESPAN || '20m'),
      refreshTokenLifespanMs: ms(process.env.REFRESH_TOKEN_LIFESPAN || '7d'),
      revokedUserAccessLifespanMs: ms(process.env.REVOKED_USER_ACCESS_LIFESPAN || '7d'),
      tokenForStudentReconciliationLifespan: '1h',
      passwordResetTokenLifespan: '1h',
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
        cpfReceipts: {
          client: {
            accessKeyId: process.env.CPF_RECEIPTS_STORAGE_ACCESS_KEY_ID,
            secretAccessKey: process.env.CPF_RECEIPTS_STORAGE_SECRET_ACCESS_KEY,
            endpoint: process.env.CPF_RECEIPTS_STORAGE_ENDPOINT,
            region: process.env.CPF_RECEIPTS_STORAGE_REGION,
            bucket: process.env.CPF_RECEIPTS_STORAGE_BUCKET_NAME,
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
      dayBeforeRetrying: _getNumber(process.env.DAY_BEFORE_RETRYING, 4),
      dayBeforeCompetenceResetV2: _getNumber(process.env.DAY_BEFORE_COMPETENCE_RESET_V2, 7),
      garAccessV2: toBoolean(process.env.GAR_ACCESS_V2),
      maxReachableLevel: _getNumber(process.env.MAX_REACHABLE_LEVEL, 5),
      newYearOrganizationLearnersImportDate: _getDate(process.env.NEW_YEAR_ORGANIZATION_LEARNERS_IMPORT_DATE),
      successProbabilityThreshold: parseFloat(process.env.SUCCESS_PROBABILITY_THRESHOLD ?? '0.95'),
      pixCertifScoBlockedAccessDateLycee: process.env.PIX_CERTIF_SCO_BLOCKED_ACCESS_DATE_LYCEE,
      pixCertifScoBlockedAccessDateCollege: process.env.PIX_CERTIF_SCO_BLOCKED_ACCESS_DATE_COLLEGE,
      scheduleComputeOrganizationLearnersCertificability: {
        cron: process.env.SCHEDULE_COMPUTE_LEARNERS_CERTIFICABILITY_JOB_CRON || '0 21 * * *',
        chunkSize: process.env.SCHEDULE_COMPUTE_LEARNERS_CERTIFICABILITY_CHUNK_SIZE || 1000,
        synchronously: toBoolean(process.env.SCHEDULE_COMPUTE_LEARNERS_CERTIFICABILITY_SYNCHRONOUSLY),
      },
      scoAccountRecoveryKeyLifetimeMinutes: process.env.SCO_ACCOUNT_RECOVERY_KEY_LIFETIME_MINUTES,
    },
    featureToggles: {
      deprecatePoleEmploiPushNotification: toBoolean(process.env.DEPRECATE_PE_PUSH_NOTIFICATION),
      isAlwaysOkValidateNextChallengeEndpointEnabled: toBoolean(
        process.env.FT_ALWAYS_OK_VALIDATE_NEXT_CHALLENGE_ENDPOINT,
      ),
      setupEcosystemBeforeStart: toBoolean(process.env.FT_SETUP_ECOSYSTEM_BEFORE_START) || false,
    },
    hapi: {
      options: {},
      enableRequestMonitoring: toBoolean(process.env.ENABLE_REQUEST_MONITORING),
    },
    infra: {
      appName: process.env.APP,
      containerName: process.env.CONTAINER,
      concurrencyForHeavyOperations: _getNumber(process.env.INFRA_CONCURRENCY_HEAVY_OPERATIONS, 2),
      chunkSizeForCampaignResultProcessing: _getNumber(process.env.INFRA_CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING, 10),
      chunkSizeForOrganizationLearnerDataProcessing: _getNumber(
        process.env.INFRA_CHUNK_SIZE_ORGANIZATION_LEARNER_DATA_PROCESSING,
        1000,
      ),
      engineeringUserId: process.env.ENGINEERING_USER_ID,
      metricsFlushIntervalSecond: _getNumber(process.env.METRICS_FLUSH_INTERVAL_SECOND, 15),
      startJobInWebProcess: toBoolean(process.env.START_JOB_IN_WEB_PROCESS),
    },
    jwtConfig: {
      certificationResults: {
        scope: process.env.CERTIFICATION_RESULTS_JWT_SCOPE || 'certificationResultsLink',
        tokenLifespan: process.env.CERTIFICATION_RESULTS_JWT_TOKEN_LIFE_SPAN || '30d',
      },
    },
    lcms: {
      url: _removeTrailingSlashFromUrl(process.env.CYPRESS_LCMS_API_URL || process.env.LCMS_API_URL || ''),
      apiKey: process.env.CYPRESS_LCMS_API_KEY || process.env.LCMS_API_KEY,
    },
    llm: {
      temporaryStorage: {
        expirationDelaySeconds: ms(process.env.LLM_CHAT_TEMPORARY_STORAGE_EXP_DELAY_SECONDS ?? '12h'),
      },
      getConfigurationUrl: _removeTrailingSlashFromUrl(process.env.LLM_API_GET_CONFIGURATIONS_URL ?? ''),
      postPromptUrl: _removeTrailingSlashFromUrl(process.env.LLM_API_POST_PROMPT_URL ?? ''),
      authSecret: process.env.LLM_API_JWT_SECRET,
    },
    logging: {
      enabled: toBoolean(process.env.LOG_ENABLED),
      logLevel: process.env.LOG_LEVEL || 'info',
      logForHumans: _getLogForHumans(),
      logForHumansCompactFormat: process.env.LOG_FOR_HUMANS_FORMAT === 'compact',
      enableKnexPerformanceMonitoring: toBoolean(process.env.ENABLE_KNEX_PERFORMANCE_MONITORING),
      enableLogStartingEventDispatch: toBoolean(process.env.LOG_STARTING_EVENT_DISPATCH),
      enableLogEndingEventDispatch: toBoolean(process.env.LOG_ENDING_EVENT_DISPATCH),
      opsEventIntervalInSeconds: process.env.OPS_EVENT_INTERVAL_IN_SECONDS || 15,
      debugSections: process.env.LOG_DEBUG?.split(',') ?? [],
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
      jwkModulusLength: 4096,
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
      flushIntervalSeconds: _getNumber(process.env.DIRECT_METRICS_FLUSH_INTERVAL, 5),
      isDirectMetricsEnabled: toBoolean(process.env.FT_ENABLE_DIRECT_METRICS),
      isOppsyDisabled: toBoolean(process.env.FT_OPPSY_DISABLED),
    },
    partner: {
      fetchTimeOut: ms(process.env.FETCH_TIMEOUT_MILLISECONDS || '20s'),
    },
    pgBoss: {
      connexionPoolMaxSize: _getNumber(process.env.PGBOSS_CONNECTION_POOL_MAX_SIZE, 2),
      teamSize: _getNumber(process.env.PG_BOSS_TEAM_SIZE, 1),
      teamConcurrency: _getNumber(process.env.PG_BOSS_TEAM_CONCURRENCY, 1),
      monitorStateIntervalSeconds: _getNumber(process.env.PGBOSS_MONITOR_STATE_INTERVAL_SECONDS, undefined),
      // 43200 is equal to 12 hours - its the default pgboss configuration
      archiveFailedAfterSeconds: _getNumber(process.env.PGBOSS_ARCHIVE_FAILED_AFTER_SECONDS, 43200),
      validationFileJobEnabled: process.env.PGBOSS_VALIDATION_FILE_JOB_ENABLED
        ? toBoolean(process.env.PGBOSS_VALIDATION_FILE_JOB_ENABLED)
        : true,
      importFileJobEnabled: process.env.PGBOSS_IMPORT_FILE_JOB_ENABLED
        ? toBoolean(process.env.PGBOSS_IMPORT_FILE_JOB_ENABLED)
        : true,
      plannerJobEnabled: process.env.PGBOSS_PLANNER_JOB_ENABLED
        ? toBoolean(process.env.PGBOSS_PLANNER_JOB_ENABLED)
        : true,
      exportSenderJobEnabled: process.env.PGBOSS_EXPORT_SENDER_JOB_ENABLED
        ? toBoolean(process.env.PGBOSS_EXPORT_SENDER_JOB_ENABLED)
        : true,
    },
    poleEmploi: {
      clientId: process.env.POLE_EMPLOI_CLIENT_ID,
      clientSecret: process.env.POLE_EMPLOI_CLIENT_SECRET,
      poleEmploiSendingsLimit: _getNumber(process.env.POLE_EMPLOI_SENDING_LIMIT, 100),
      pushEnabled: toBoolean(process.env.PUSH_DATA_TO_POLE_EMPLOI_ENABLED),
      sendingUrl: process.env.POLE_EMPLOI_SENDING_URL,
      tokenUrl: process.env.POLE_EMPLOI_TOKEN_URL,
    },
    port: parseInt(process.env.PORT, 10) || 3000,
    rootPath: path.normalize(__dirname + '/..'),
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
    temporaryKey: {
      secret: process.env.AUTH_SECRET,
      tokenLifespan: '1d',
      payload: 'PixResetPassword',
    },
    temporarySessionsStorageForMassImport: {
      expirationDelaySeconds:
        parseInt(process.env.SESSIONS_MASS_IMPORT_TEMPORARY_STORAGE_EXP_DELAY_SECONDS, 10) || 7200,
    },
    temporaryStorage: {
      expirationDelaySeconds: parseInt(process.env.TEMPORARY_STORAGE_EXPIRATION_DELAY_SECONDS, 10) || 600,
      redisUrl: process.env.REDIS_URL,
    },
    temporaryStorageForEmailValidationDemands: {
      expirationDelaySeconds: ms(process.env.EMAIL_VALIDATION_DEMAND_TEMPORARY_STORAGE_LIFESPAN || '3d') / 1000,
    },
    temporaryStorageForAnonymousUserTokens: {
      expirationDelaySeconds: ms(process.env.ANONYMOUS_USER_TOKEN_TEMPORARY_STORAGE_LIFESPAN || '1d') / 1000,
    },
    v3Certification: {
      numberOfChallengesPerCourse: 32,
      defaultProbabilityToPickChallenge: 51,
      defaultCandidateCapacity: -3,
      challengesBetweenSameCompetence: 2,
      scoring: {
        minimumAnswersRequiredToValidateACertification: 20,
        maximumReachableScore: 895,
      },
      maxReachableLevel: 7,
    },
    version: process.env.CONTAINER_VERSION || 'development',
    autonomousCourse: {
      autonomousCoursesOrganizationId: parseInt(process.env.AUTONOMOUS_COURSES_ORGANIZATION_ID, 10),
    },
  };

  if (process.env.NODE_ENV === 'test') {
    config.apiData = {
      url: 'http://example.net',
      credentials: {
        username: 'user',
        password: 'passowrd',
      },
      queries: {
        coverRateByTubes: 'coverage-rate-query-id',
      },
    };

    config.auditLogger.isEnabled = true;
    config.auditLogger.baseUrl = 'http://audit-logger.local';
    config.auditLogger.clientSecret = 'client-super-secret';

    config.baseUrl = 'https://api.test.pix.fr';

    config.oidcExampleNet = {
      clientId: 'client',
      clientSecret: 'secret',
      enabled: true,
      enabledForPixAdmin: true,
      openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
      organizationName: 'Oidc Example',
      postLogoutRedirectUri: 'https://app.dev.pix.local/connexion',
      redirectUri: 'https://app.dev.pix.local/connexion/oidc-example-net',
    };

    config.port = 0;

    config.lcms.apiKey = 'test-api-key';
    config.lcms.url = 'https://lcms-test.pix.fr/api';

    config.llm.getConfigurationUrl = 'https://llm-test.pix.fr/api/configurations';
    config.llm.postPromptUrl = 'https://llm-test.pix.fr/api/chat';
    config.llm.temporaryStorage.expirationDelaySeconds = 1;
    config.llm.authSecret = 'Le secret dans les tests';

    config.domain.tldFr = '.fr';
    config.domain.tldOrg = '.org';
    config.domain.pix = 'https://pix';
    config.domain.pixOrga = 'https://orga.pix';
    config.domain.pixApp = 'https://test.app.pix';

    config.features.dayBeforeRetrying = 4;
    config.features.dayBeforeImproving = 4;
    config.features.dayBeforeCompetenceResetV2 = 7;
    config.features.garAccessV2 = false;
    config.features.maxReachableLevel = 5;
    config.features.pixCertifScoBlockedAccessDateLycee = null;
    config.features.pixCertifScoBlockedAccessDateCollege = null;

    config.featureToggles.deprecatePoleEmploiPushNotification = false;
    config.featureToggles.isAlwaysOkValidateNextChallengeEndpointEnabled = false;
    config.metrics.isDirectMetricsEnabled = false;
    config.metrics.isOppsyDisabled = false;

    config.lti.authorizedPlatforms = ['https://moodle.example.net'];
    config.lti.jwkModulusLength = 2048;

    config.mailing.enabled = false;
    config.mailing.provider = 'brevo';
    config.mailing.smtpUrl = 'smtp://username:password@localhost:1025/';

    config.mailing.brevo.apiKey = 'test-api-key';
    config.mailing.brevo.templates.accountCreationTemplateId = 'test-account-creation-template-id';
    config.mailing.brevo.templates.organizationInvitationTemplateId = 'test-organization-invitation-demand-template-id';
    config.mailing.brevo.templates.organizationInvitationScoTemplateId =
      'test-organization-invitation-sco-demand-template-id';
    config.mailing.brevo.templates.certificationCenterInvitationTemplateId =
      'test-certification-center-invitation-template-id';
    config.mailing.brevo.templates.certificationResultTemplateId = 'test-certification-result-template-id';
    config.mailing.brevo.templates.passwordResetTemplateId = 'test-password-reset-template-id';
    config.mailing.brevo.templates.emailChangeTemplateId = 'test-email-change-template-id';
    config.mailing.brevo.templates.accountRecoveryTemplateId = 'test-account-recovery-template-id';
    config.mailing.brevo.templates.emailVerificationCodeTemplateId = 'test-email-verification-code-template-id';
    config.mailing.brevo.templates.cpfEmailTemplateId = 'test-cpf-email-template-id';
    config.mailing.brevo.templates.acquiredCleaResultTemplateId = 'test-acquired-clea-result-template-id';
    config.mailing.brevo.templates.targetProfileNotCertifiableTemplateId =
      'test-target-profile-no-certifiable-template-id';
    config.mailing.brevo.templates.warningConnectionTemplateId = 'test-warning-connection-template-id';

    config.bcryptNumberOfSaltRounds = 1;

    config.authentication.secret = 'the-password-must-be-at-least-32-characters-long';

    config.temporaryKey.secret = 'the-password-must-be-at-least-32-characters-long';

    config.temporaryStorage.redisUrl = process.env.TEST_REDIS_URL;
    config.authentication.permitPixAdminLoginFromPassword = false;

    config.cpf.storage = {
      cpfExports: {
        client: {
          accessKeyId: 'cpfExports.accessKeyId',
          secretAccessKey: 'cpfExports.secretAccessKey',
          endpoint: 'http://cpf-exports.fake.endpoint.example.net',
          region: 'cpfExports.region',
          bucket: 'cpfExports.bucket',
        },
        commands: {
          preSignedExpiresIn: 3600,
        },
      },
      cpfReceipts: {
        client: {
          accessKeyId: 'cpfReceipts.accessKeyId',
          secretAccessKey: 'cpfReceipts.secretAccessKey',
          endpoint: 'http://cpf-receipts.fake.endpoint.example.net',
          region: 'cpfReceipts.region',
          bucket: 'cpfReceipts.bucket',
        },
      },
    };

    config.cpf.sendEmailJob = {
      recipient: 'team-all-star-certif-de-ouf@example.net',
      cron: '0 3 * * *',
    };

    config.logging.enabled = toBoolean(process.env.TEST_LOG_ENABLED);
    config.logging.enableLogKnexQueries = false;
    config.logging.enableLogStartingEventDispatch = false;
    config.logging.enableLogEndingEventDispatch = false;

    // TODO: Rather use config.caching.redisUrl = process.env.TEST_REDIS_URL;
    config.caching.redisUrl = null;
    config.caching.redisCacheKeyLockTTL = 100;
    config.caching.redisCacheLockedWaitBeforeRetry = 1;

    config.redis = {
      url: process.env.TEST_REDIS_URL,
    };

    config.import = {
      storage: {
        client: {
          accessKeyId: 'nothing',
          secretAccessKey: 'nothing',
          endpoint: process.env.TEST_IMPORT_STORAGE_ENDPOINT,
          region: 'nothing',
          bucket: process.env.TEST_IMPORT_STORAGE_BUCKET_NAME,
          forcePathStyle: true,
        },
      },
    };

    config.dataProtectionPolicy.updateDate = '2022-12-25 00:00:01';

    config.partner.fetchTimeOut = '10ms';

    config.identityProviderConfigKey = null;

    config.apiManager.url = 'http://external-partners-access/';

    config.infra.engineeringUserId = 800;
  }

  return config;
})();

export { configuration as config, schema };
