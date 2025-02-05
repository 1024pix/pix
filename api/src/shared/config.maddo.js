import 'dotenv/config';

import path from 'node:path';
import * as url from 'node:url';

import dayjs from 'dayjs';
import Joi from 'joi';
import ms from 'ms';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// eslint-disable-next-line no-unused-vars
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

// eslint-disable-next-line no-unused-vars
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

// eslint-disable-next-line no-unused-vars
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
  ACCESS_TOKEN_LIFESPAN: Joi.string().optional(),
  AUTH_SECRET: Joi.string().required(),

  DATABASE_CONNECTION_POOL_MAX_SIZE: Joi.number().integer().min(0).optional(),
  DATABASE_CONNECTION_POOL_MIN_SIZE: Joi.number().integer().min(0).optional(),
  DATABASE_URL: Joi.string().uri().optional().required(),

  DATAMART_DATABASE_URL: Joi.string().uri().optional().required(),
  TEST_DATAMART_DATABASE_URL: Joi.string().uri().optional(),

  ENABLE_KNEX_PERFORMANCE_MONITORING: Joi.string().optional().valid('true', 'false'),

  KNEX_ASYNC_STACKTRACE_ENABLED: Joi.string().optional().valid('true', 'false'),

  LOG_ENABLED: Joi.string().required().valid('true', 'false'),
  LOG_FOR_HUMANS: Joi.string().optional().valid('true', 'false'),
  LOG_LEVEL: Joi.string().optional().valid('silent', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'),
  LOG_OPS_METRICS: Joi.string().optional().valid('true', 'false'),

  NODE_ENV: Joi.string().optional().valid('development', 'test', 'production'),

  REDIS_URL: Joi.string().uri().optional().required(),

  TEST_DATABASE_URL: Joi.string().optional(),
  TEST_LOG_ENABLED: Joi.string().optional().valid('true', 'false'),
  TEST_REDIS_URL: Joi.string().optional(),

  APIM_URL: Joi.string().optional().required(),
}).options({ allowUnknown: true });

const configuration = (function () {
  const config = {
    apiManager: {
      url: process.env.APIM_URL || 'https://gateway.pix.fr',
    },
    apimRegisterApplicationsCredentials: [
      {
        clientId: process.env.APIM_OSMOSE_CLIENT_ID,
        clientSecret: process.env.APIM_OSMOSE_CLIENT_SECRET,
        scope: 'organizations-certifications-result',
        source: 'livretScolaire',
      },
      {
        clientId: process.env.APIM_POLE_EMPLOI_CLIENT_ID,
        clientSecret: process.env.APIM_POLE_EMPLOI_CLIENT_SECRET,
        scope: 'pole-emploi-participants-result',
        source: 'poleEmploi',
      },
      {
        clientId: process.env.APIM_PIX_DATA_CLIENT_ID,
        clientSecret: process.env.APIM_PIX_DATA_CLIENT_SECRET,
        scope: 'statistics',
        source: 'pixData',
      },
      {
        clientId: process.env.APIM_PIX_PARCOURSUP_CLIENT_ID,
        clientSecret: process.env.APIM_PIX_PARCOURSUP_CLIENT_SECRET,
        scope: 'parcoursup',
        source: 'parcoursup',
      },
    ],
    auditLogger: {
      isEnabled: toBoolean(process.env.PIX_AUDIT_LOGGER_ENABLED),
      baseUrl: process.env.PIX_AUDIT_LOGGER_BASE_URL,
      clientSecret: process.env.PIX_AUDIT_LOGGER_CLIENT_SECRET,
    },
    authentication: {
      secret: process.env.AUTH_SECRET,
      accessTokenLifespanMs: ms(process.env.ACCESS_TOKEN_LIFESPAN || '20m'),
      refreshTokenLifespanMs: ms(process.env.REFRESH_TOKEN_LIFESPAN || '7d'),
      refreshTokenLifespanMsByScope: {
        'mon-pix': ms(process.env.REFRESH_TOKEN_LIFESPAN_MON_PIX || '7d'),
        'pix-orga': ms(process.env.REFRESH_TOKEN_LIFESPAN_PIX_ORGA || '7d'),
        'pix-certif': ms(process.env.REFRESH_TOKEN_LIFESPAN_PIX_CERTIF || '7d'),
        'pix-admin': ms(process.env.REFRESH_TOKEN_LIFESPAN_PIX_ADMIN || '7d'),
      },
      revokedUserAccessLifespanMs: ms(process.env.REVOKED_USER_ACCESS_LIFESPAN || '7d'),
      tokenForCampaignResultLifespan: process.env.CAMPAIGN_RESULT_ACCESS_TOKEN_LIFESPAN || '1h',
      tokenForStudentReconciliationLifespan: '1h',
      passwordResetTokenLifespan: '1h',
    },
    authenticationSession: {
      temporaryStorage: {
        expirationDelaySeconds:
          parseInt(process.env.AUTHENTICATION_SESSION_TEMPORARY_STORAGE_EXP_DELAY_SECONDS, 10) || 1140,
      },
    },
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
    environment: process.env.NODE_ENV || 'development',
    features: {},
    featureToggles: {},
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
      metricsFlushIntervalSecond: _getNumber(process.env.METRICS_FLUSH_INTERVAL_SECOND, 15),
      startJobInWebProcess: toBoolean(process.env.START_JOB_IN_WEB_PROCESS),
    },
    jwtConfig: {
      livretScolaire: {
        secret: process.env.LIVRET_SCOLAIRE_AUTH_SECRET,
        tokenLifespan: process.env.TOKEN_LIFE_SPAN || '1h',
      },
      poleEmploi: {
        secret: process.env.POLE_EMPLOI_AUTH_SECRET,
        tokenLifespan: process.env.TOKEN_LIFE_SPAN || '1h',
      },
      pixData: {
        secret: process.env.PIX_DATA_AUTH_SECRET,
        tokenLifespan: process.env.TOKEN_LIFE_SPAN || '1h',
      },
      parcoursup: {
        secret: process.env.PIX_PARCOURSUP_AUTH_SECRET,
        tokenLifespan: process.env.TOKEN_LIFE_SPAN || '1h',
      },
      certificationResults: {
        scope: process.env.CERTIFICATION_RESULTS_JWT_SCOPE || 'certificationResultsLink',
        tokenLifespan: process.env.CERTIFICATION_RESULTS_JWT_TOKEN_LIFE_SPAN || '30d',
      },
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
    },
    logOpsMetrics: toBoolean(process.env.LOG_OPS_METRICS),
    metrics: {
      flushIntervalSeconds: _getNumber(process.env.DIRECT_METRICS_FLUSH_INTERVAL, 5),
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
  };

  if (process.env.NODE_ENV === 'test') {
    config.auditLogger.isEnabled = true;
    config.auditLogger.baseUrl = 'http://audit-logger.local';
    config.auditLogger.clientSecret = 'client-super-secret';

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

    config.authentication.secret = 'the-password-must-be-at-least-32-characters-long';

    config.temporaryKey.secret = 'the-password-must-be-at-least-32-characters-long';

    config.temporaryStorage.redisUrl = process.env.TEST_REDIS_URL;

    config.apimRegisterApplicationsCredentials = [
      {
        clientId: 'test-apimOsmoseClientId',
        clientSecret: 'test-apimOsmoseClientSecret',
        scope: 'organizations-certifications-result',
        source: 'livretScolaire',
      },
      {
        clientId: 'test-poleEmploiClientId',
        clientSecret: 'test-poleEmploiClientSecret',
        scope: 'pole-emploi-participants-result',
        source: 'poleEmploi',
      },
      {
        clientId: 'test-pixDataCliendId',
        clientSecret: 'pixDataClientSecret',
        scope: 'statistics',
        source: 'pixData',
      },
      {
        clientId: 'test-parcoursupClientId',
        clientSecret: 'test-parcoursupClientSecret',
        scope: 'parcoursup',
        source: 'parcoursup',
      },
    ];

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

    config.jwtConfig.livretScolaire.secret = 'test-secretOsmose';
    config.jwtConfig.poleEmploi.secret = 'test-secretPoleEmploi';
    config.jwtConfig.pixData.secret = 'test-secretPixData';
    config.jwtConfig.parcoursup.secret = 'test-secretPixParcoursup';

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

    config.dataProtectionPolicy.updateDate = '2022-12-25 00:00:01';

    config.partner.fetchTimeOut = '10ms';

    config.identityProviderConfigKey = null;

    config.apiManager.url = 'http://external-partners-access/';
  }

  return config;
})();

export { configuration as config, schema };
