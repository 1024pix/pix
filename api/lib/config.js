/* eslint-disable node/no-process-env */
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import path from 'path';
import moment from 'moment';
import ms from 'ms';
import { getArrayOfStrings } from '../lib/infrastructure/utils/string-utils';

function parseJSONEnv(varName) {
  if (process.env[varName]) {
    return JSON.parse(process.env[varName]);
  }
  return undefined;
}

function isFeatureEnabled(environmentVariable) {
  return environmentVariable === 'true';
}

function isBooleanFeatureEnabledElseDefault(environmentVariable, defaultValue) {
  return environmentVariable === 'true' ? true : defaultValue;
}

function _getNumber(numberAsString, defaultValue) {
  const number = parseInt(numberAsString, 10);
  return isNaN(number) ? defaultValue : number;
}

function _getDate(dateAsString) {
  if (!dateAsString) {
    return null;
  }
  const dateAsMoment = moment(dateAsString);
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

export default (function () {
  const config = {
    rootPath: path.normalize(__dirname + '/..'),

    port: parseInt(process.env.PORT, 10) || 3000,

    environment: process.env.NODE_ENV || 'development',

    logOpsMetrics: isFeatureEnabled(process.env.LOG_OPS_METRICS),

    version: process.env.CONTAINER_VERSION || 'development',

    hapi: {
      options: {},
      enableRequestMonitoring: isFeatureEnabled(process.env.ENABLE_REQUEST_MONITORING),
    },

    domain: {
      tldFr: process.env.TLD_FR || '.fr',
      tldOrg: process.env.TLD_ORG || '.org',
      pix: process.env.DOMAIN_PIX || 'https://pix',
      pixApp: process.env.DOMAIN_PIX_APP || 'https://app.pix',
      pixOrga: process.env.DOMAIN_PIX_ORGA || 'https://orga.pix',
      pixCertif: process.env.DOMAIN_PIX_CERTIF || 'https://certif.pix',
    },

    partner: {
      fetchTimeOut: ms(process.env.FETCH_TIMEOUT_MILLISECONDS || '20s'),
    },

    dataProtectionPolicy: {
      updateDate: process.env.DATA_PROTECTION_POLICY_UPDATE_DATE || null,
    },

    lcms: {
      url: _removeTrailingSlashFromUrl(process.env.CYPRESS_LCMS_API_URL || process.env.LCMS_API_URL || ''),
      apiKey: process.env.CYPRESS_LCMS_API_KEY || process.env.LCMS_API_KEY,
    },

    logging: {
      enabled: isFeatureEnabled(process.env.LOG_ENABLED),
      logLevel: process.env.LOG_LEVEL || 'info',
      logForHumans: _getLogForHumans(),
      enableKnexPerformanceMonitoring: isFeatureEnabled(process.env.ENABLE_KNEX_PERFORMANCE_MONITORING),
      enableLogStartingEventDispatch: isFeatureEnabled(process.env.LOG_STARTING_EVENT_DISPATCH),
      enableLogEndingEventDispatch: isFeatureEnabled(process.env.LOG_ENDING_EVENT_DISPATCH),
      emitOpsEventEachSeconds: isFeatureEnabled(process.env.OPS_EVENT_EACH_SECONDS) || 15,
    },

    mailing: {
      enabled: isFeatureEnabled(process.env.MAILING_ENABLED),
      provider: process.env.MAILING_PROVIDER || 'sendinblue',
      sendinblue: {
        apiKey: process.env.SENDINBLUE_API_KEY,
        templates: {
          accountCreationTemplateId: process.env.SENDINBLUE_ACCOUNT_CREATION_TEMPLATE_ID,
          organizationInvitationTemplateId: process.env.SENDINBLUE_ORGANIZATION_INVITATION_TEMPLATE_ID,
          organizationInvitationScoTemplateId: process.env.SENDINBLUE_ORGANIZATION_INVITATION_SCO_TEMPLATE_ID,
          certificationCenterInvitationTemplateId: process.env.SENDINBLUE_CERTIFICATION_CENTER_INVITATION_TEMPLATE_ID,
          passwordResetTemplateId: process.env.SENDINBLUE_PASSWORD_RESET_TEMPLATE_ID,
          certificationResultTemplateId: process.env.SENDINBLUE_CERTIFICATION_RESULT_TEMPLATE_ID,
          accountRecoveryTemplateId: process.env.SENDINBLUE_ACCOUNT_RECOVERY_TEMPLATE_ID,
          emailVerificationCodeTemplateId: process.env.SENDINBLUE_EMAIL_VERIFICATION_CODE_TEMPLATE_ID,
          cpfEmailTemplateId: process.env.SENDINBLUE_CPF_TEMPLATE_ID,
          acquiredCleaResultTemplateId: process.env.SENDINBLUE_CLEA_ACQUIRED_RESULT_TEMPLATE_ID,
        },
      },
    },

    authentication: {
      secret: process.env.AUTH_SECRET,
      accessTokenLifespanMs: ms(process.env.ACCESS_TOKEN_LIFESPAN || '20m'),
      refreshTokenLifespanMs: ms(process.env.REFRESH_TOKEN_LIFESPAN || '7d'),
      tokenForCampaignResultLifespan: process.env.CAMPAIGN_RESULT_ACCESS_TOKEN_LIFESPAN || '1h',
      tokenForStudentReconciliationLifespan: '1h',
      passwordResetTokenLifespan: '1h',
    },

    anonymous: {
      accessTokenLifespanMs: ms(process.env.ANONYMOUS_ACCESS_TOKEN_LIFESPAN || '4h'),
    },

    apiManager: {
      url: process.env.APIM_URL || 'https://gateway.pix.fr',
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
    },

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

    temporaryKey: {
      secret: process.env.AUTH_SECRET,
      tokenLifespan: '1d',
      payload: 'PixResetPassword',
    },

    account: {
      passwordValidationPattern: '^(?=.*\\p{Lu})(?=.*\\p{Ll})(?=.*\\d).{8,}$',
    },

    bcryptNumberOfSaltRounds: _getNumber(process.env.BCRYPT_NUMBER_OF_SALT_ROUNDS, 10),

    availableCharacterForCode: {
      letters: 'BCDFGHJKMPQRTVWXY',
      numbers: '2346789',
    },

    login: {
      temporaryBlockingThresholdFailureCount: _getNumber(
        process.env.LOGIN_TEMPORARY_BLOCKING_THRESHOLD_FAILURE_COUNT || 10
      ),
      temporaryBlockingBaseTimeMs: ms(process.env.LOGIN_TEMPORARY_BLOCKING_BASE_TIME || '2m'),
      blockingLimitFailureCount: _getNumber(process.env.LOGIN_BLOCKING_LIMIT_FAILURE_COUNT || 50),
    },

    caching: {
      redisUrl: process.env.REDIS_URL,
      redisCacheKeyLockTTL: parseInt(process.env.REDIS_CACHE_KEY_LOCK_TTL, 10) || 60000,
      redisCacheLockedWaitBeforeRetry: parseInt(process.env.REDIS_CACHE_LOCKED_WAIT_BEFORE_RETRY, 10) || 1000,
    },
    pgBoss: {
      connexionPoolMaxSize: _getNumber(process.env.PGBOSS_CONNECTION_POOL_MAX_SIZE, 2),
      teamSize: _getNumber(process.env.PG_BOSS_TEAM_SIZE, 1),
      teamConcurrency: _getNumber(process.env.PG_BOSS_TEAM_CONCURRENCY, 1),
      monitorStateIntervalSeconds: _getNumber(process.env.PGBOSS_MONITOR_STATE_INTERVAL_SECONDS, undefined),
    },
    features: {
      dayBeforeImproving: _getNumber(process.env.DAY_BEFORE_IMPROVING, 4),
      dayBeforeRetrying: _getNumber(process.env.DAY_BEFORE_RETRYING, 4),
      dayBeforeCompetenceResetV2: _getNumber(process.env.DAY_BEFORE_COMPETENCE_RESET_V2, 7),
      garAccessV2: isFeatureEnabled(process.env.GAR_ACCESS_V2),
      maxReachableLevel: _getNumber(process.env.MAX_REACHABLE_LEVEL, 5),
      newYearOrganizationLearnersImportDate: _getDate(process.env.NEW_YEAR_ORGANIZATION_LEARNERS_IMPORT_DATE),
      numberOfChallengesForFlashMethod: _getNumber(process.env.NUMBER_OF_CHALLENGES_FOR_FLASH_METHOD),
      successProbabilityThreshold: parseFloat(process.env.SUCCESS_PROBABILITY_THRESHOLD ?? '0.95'),
      pixCertifScoBlockedAccessWhitelist: getArrayOfStrings(process.env.PIX_CERTIF_SCO_BLOCKED_ACCESS_WHITELIST),
      pixCertifScoBlockedAccessDateLycee: process.env.PIX_CERTIF_SCO_BLOCKED_ACCESS_DATE_LYCEE,
      pixCertifScoBlockedAccessDateCollege: process.env.PIX_CERTIF_SCO_BLOCKED_ACCESS_DATE_COLLEGE,
      scoAccountRecoveryKeyLifetimeMinutes: process.env.SCO_ACCOUNT_RECOVERY_KEY_LIFETIME_MINUTES,
    },

    featureToggles: {
      isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: isFeatureEnabled(
        process.env.FT_CLEA_RESULTS_RETRIEVAL_BY_HABILITATED_CERTIFICATION_CENTERS
      ),
      isMassiveSessionManagementEnabled: isFeatureEnabled(process.env.FT_MASSIVE_SESSION_MANAGEMENT),
      isAlwaysOkValidateNextChallengeEndpointEnabled: isFeatureEnabled(
        process.env.FT_ALWAYS_OK_VALIDATE_NEXT_CHALLENGE_ENDPOINT
      ),
    },

    infra: {
      concurrencyForHeavyOperations: _getNumber(process.env.INFRA_CONCURRENCY_HEAVY_OPERATIONS, 2),
      chunkSizeForCampaignResultProcessing: _getNumber(process.env.INFRA_CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING, 10),
      chunkSizeForOrganizationLearnerDataProcessing: _getNumber(
        process.env.INFRA_CHUNK_SIZE_ORGANIZATION_LEARNER_DATA_PROCESSING,
        1000
      ),
    },

    sentry: {
      enabled: isFeatureEnabled(process.env.SENTRY_ENABLED),
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || 'development',
      maxBreadcrumbs: _getNumber(process.env.SENTRY_MAX_BREADCRUMBS, 100),
      debug: isFeatureEnabled(process.env.SENTRY_DEBUG),
      maxValueLength: 1000,
    },

    poleEmploi: {
      clientId: process.env.POLE_EMPLOI_CLIENT_ID,
      clientSecret: process.env.POLE_EMPLOI_CLIENT_SECRET,
      tokenUrl: process.env.POLE_EMPLOI_TOKEN_URL,
      sendingUrl: process.env.POLE_EMPLOI_SENDING_URL,
      userInfoUrl: process.env.POLE_EMPLOI_OIDC_USER_INFO_URL,
      authenticationUrl: process.env.POLE_EMPLOI_OIDC_AUTHENTICATION_URL,
      logoutUrl: process.env.POLE_EMPLOI_OIDC_LOGOUT_URL,
      afterLogoutUrl: process.env.POLE_EMPLOI_OIDC_AFTER_LOGOUT_URL,
      temporaryStorage: {
        idTokenLifespanMs: ms(process.env.POLE_EMPLOI_ID_TOKEN_LIFESPAN || '7d'),
      },
      poleEmploiSendingsLimit: _getNumber(process.env.POLE_EMPLOI_SENDING_LIMIT, 100),
      accessTokenLifespanMs: ms(process.env.POLE_EMPLOI_ACCESS_TOKEN_LIFESPAN || '7d'),
    },

    cnav: {
      clientId: process.env.CNAV_CLIENT_ID,
      authenticationUrl: process.env.CNAV_AUTHENTICATION_URL,
      userInfoUrl: process.env.CNAV_OIDC_USER_INFO_URL,
      tokenUrl: process.env.CNAV_TOKEN_URL,
      clientSecret: process.env.CNAV_CLIENT_SECRET,
      accessTokenLifespanMs: ms(process.env.CNAV_ACCESS_TOKEN_LIFESPAN || '7d'),
    },

    fwb: {
      clientId: process.env.FWB_CLIENT_ID,
      clientSecret: process.env.FWB_CLIENT_SECRET,
      tokenUrl: process.env.FWB_TOKEN_URL,
      authenticationUrl: process.env.FWB_AUTHENTICATION_URL,
      userInfoUrl: process.env.FWB_USER_INFO_URL,
      accessTokenLifespanMs: ms(process.env.FWB_ACCESS_TOKEN_LIFESPAN || '7d'),
    },

    authenticationSession: {
      temporaryStorage: {
        expirationDelaySeconds:
          parseInt(process.env.AUTHENTICATION_SESSION_TEMPORARY_STORAGE_EXP_DELAY_SECONDS, 10) || 1140,
      },
    },

    temporaryStorage: {
      expirationDelaySeconds: parseInt(process.env.TEMPORARY_STORAGE_EXPIRATION_DELAY_SECONDS, 10) || 600,
      redisUrl: process.env.REDIS_URL,
    },

    graviteeRegisterApplicationsCredentials: [
      {
        clientId: process.env.GRAVITEE_OSMOSE_CLIENT_ID,
        clientSecret: process.env.GRAVITEE_OSMOSE_CLIENT_SECRET,
        scope: 'organizations-certifications-result',
        source: 'livretScolaire',
      },
      {
        clientId: process.env.GRAVITEE_POLE_EMPLOI_CLIENT_ID,
        clientSecret: process.env.GRAVITEE_POLE_EMPLOI_CLIENT_SECRET,
        scope: 'pole-emploi-participants-result',
        source: 'poleEmploi',
      },
    ],

    cpf: {
      idClient: '03VML243',
      idContrat: 'MCFCER000209',
      codeFranceConnect: 'RS5875',
      storage: {
        accessKeyId: process.env.CPF_STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.CPF_STORAGE_SECRET_ACCESS_KEY,
        endpoint: process.env.CPF_STORAGE_ENDPOINT,
        region: process.env.CPF_STORAGE_REGION,
        bucket: process.env.CPF_STORAGE_BUCKET_NAME,
        preSignedExpiresIn: process.env.CPF_STORAGE_PRE_SIGNED_EXPIRES_IN || 3600,
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
  };

  if (config.environment === 'development') {
    config.logging.enabled = true;
  } else if (process.env.NODE_ENV === 'test') {
    config.port = 0;

    config.lcms.apiKey = 'test-api-key';
    config.lcms.url = 'https://lcms-test.pix.fr/api';

    config.domain.tldFr = '.fr';
    config.domain.tldOrg = '.org';
    config.domain.pix = 'https://pix';
    config.domain.pixOrga = 'https://orga.pix';

    config.features.dayBeforeRetrying = 4;
    config.features.dayBeforeImproving = 4;
    config.features.dayBeforeCompetenceResetV2 = 7;
    config.features.garAccessV2 = false;
    config.features.numberOfChallengesForFlashMethod = 10;
    config.features.pixCertifScoBlockedAccessDateLycee = null;
    config.features.pixCertifScoBlockedAccessDateCollege = null;

    config.featureToggles.isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled = false;
    config.featureToggles.isMassiveSessionManagementEnabled = false;

    config.mailing.enabled = false;
    config.mailing.provider = 'sendinblue';

    config.mailing.sendinblue.apiKey = 'test-api-key';
    config.mailing.sendinblue.templates.accountCreationTemplateId = 'test-account-creation-template-id';
    config.mailing.sendinblue.templates.organizationInvitationTemplateId =
      'test-organization-invitation-demand-template-id';
    config.mailing.sendinblue.templates.organizationInvitationScoTemplateId =
      'test-organization-invitation-sco-demand-template-id';
    config.mailing.sendinblue.templates.certificationResultTemplateId = 'test-certification-result-template-id';
    config.mailing.sendinblue.templates.passwordResetTemplateId = 'test-password-reset-template-id';
    config.mailing.sendinblue.templates.emailChangeTemplateId = 'test-email-change-template-id';
    config.mailing.sendinblue.templates.accountRecoveryTemplateId = 'test-account-recovery-template-id';
    config.mailing.sendinblue.templates.emailVerificationCodeTemplateId = 'test-email-verification-code-template-id';
    config.mailing.sendinblue.templates.cpfEmailTemplateId = 'test-cpf-email-template-id';
    config.mailing.sendinblue.templates.acquiredCleaResultTemplateId = 'test-acquired-clea-result-template-id';

    config.bcryptNumberOfSaltRounds = 1;

    config.authentication.secret = 'test-jwt-key';

    config.temporaryKey.secret = 'test-jwt-key';

    config.poleEmploi.clientId = 'PIX_POLE_EMPLOI_CLIENT_ID';
    config.poleEmploi.clientSecret = 'PIX_POLE_EMPLOI_CLIENT_SECRET';
    config.poleEmploi.tokenUrl = 'http://tokenUrl.fr';
    config.poleEmploi.sendingUrl = 'http://sendingUrl.fr';
    config.poleEmploi.userInfoUrl = 'http://userInfoUrl.fr';
    config.poleEmploi.authenticationUrl = 'http://authurl.fr';
    config.poleEmploi.logoutUrl = 'http://logout-url.fr';
    config.poleEmploi.afterLogoutUrl = 'http://after-logout.url';
    config.poleEmploi.temporaryStorage.redisUrl = null;

    config.temporaryStorage.redisUrl = null;

    config.cnav.clientId = 'PIX_CNAV_CLIENT_ID';
    config.cnav.authenticationUrl = 'http://idp.cnav/auth';
    config.cnav.userInfoUrl = 'http://userInfoUrl.fr';
    config.cnav.tokenUrl = 'http://idp.cnav/token';
    config.cnav.clientSecret = 'PIX_CNAV_CLIENT_SECRET';

    config.saml.accessTokenLifespanMs = 1000;

    config.graviteeRegisterApplicationsCredentials = [
      {
        clientId: 'graviteeOsmoseClientId',
        clientSecret: 'graviteeOsmoseClientSecret',
        scope: 'organizations-certifications-result',
        source: 'livretScolaire',
      },
      {
        clientId: 'poleEmploiClientId',
        clientSecret: 'poleEmploiClientSecret',
        scope: 'pole-emploi-participants-result',
        source: 'poleEmploi',
      },
    ];

    config.cpf.storage = {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      endpoint: 'http://fake.endpoint.example.net',
      region: 'region',
      bucket: 'bucket',
    };

    config.jwtConfig.livretScolaire = { secret: 'secretosmose', tokenLifespan: '1h' };
    config.jwtConfig.poleEmploi = { secret: 'secretPoleEmploi', tokenLifespan: '1h' };

    config.logging.enabled = isBooleanFeatureEnabledElseDefault(process.env.TEST_LOG_ENABLED, false);
    config.logging.enableLogKnexQueries = false;
    config.logging.enableLogStartingEventDispatch = false;
    config.logging.enableLogEndingEventDispatch = false;

    config.caching.redisUrl = null;
    config.caching.redisCacheKeyLockTTL = 0;
    config.caching.redisCacheLockedWaitBeforeRetry = 0;

    config.sentry.enabled = false;

    config.redis = {
      url: process.env.TEST_REDIS_URL,
      database: 1,
    };

    config.dataProtectionPolicy.updateDate = '2022-12-25 00:00:01';

    config.partner.fetchTimeOut = '5ms';
  }

  return config;
})();
/* eslint-enable node/no-process-env */
