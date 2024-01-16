import path from 'path';
import ms from 'ms';

import { getArrayOfStrings, getArrayOfUpperStrings } from './infrastructure/utils/string-utils.js';

import * as url from 'url';
import dayjs from 'dayjs';
import { ConfigLoader } from './infrastructure/config-loader.js';

const __dirname = url.fileURLToPath(new URL('../../', import.meta.url));
const configLoader = new ConfigLoader({ configDirectoryPath: __dirname });
await configLoader.loadConfigFile();

function parseJSONEnv(varName) {
  if (configLoader.get(varName)) {
    return JSON.parse(configLoader.get(varName));
  }
  return undefined;
}

function isFeatureEnabled(environmentVariable) {
  return environmentVariable === 'true';
}

function isFeatureNotDisabled(environmentVariable) {
  return environmentVariable !== 'false';
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
  const forceJSONLogs = configLoader.get('LOG_FOR_HUMANS') === 'false';
  return processOutputingToTerminal && !forceJSONLogs;
}

const configuration = (function () {
  const config = {
    account: {
      passwordValidationPattern: '^(?=.*\\p{Lu})(?=.*\\p{Ll})(?=.*\\d).{8,}$',
    },
    anonymous: {
      accessTokenLifespanMs: ms(configLoader.get('ANONYMOUS_ACCESS_TOKEN_LIFESPAN') || '4h'),
    },
    apiManager: {
      url: configLoader.get('APIM_URL') || 'https://gateway.pix.fr',
    },
    apimRegisterApplicationsCredentials: [
      {
        clientId: configLoader.get('APIM_OSMOSE_CLIENT_ID'),
        clientSecret: configLoader.get('APIM_OSMOSE_CLIENT_SECRET'),
        scope: 'organizations-certifications-result',
        source: 'livretScolaire',
      },
      {
        clientId: configLoader.get('APIM_POLE_EMPLOI_CLIENT_ID'),
        clientSecret: configLoader.get('APIM_POLE_EMPLOI_CLIENT_SECRET'),
        scope: 'pole-emploi-participants-result',
        source: 'poleEmploi',
      },
    ],
    auditLogger: {
      isEnabled: isFeatureEnabled(configLoader.get('PIX_AUDIT_LOGGER_ENABLED')),
      baseUrl: configLoader.get('PIX_AUDIT_LOGGER_BASE_URL'),
      clientSecret: configLoader.get('PIX_AUDIT_LOGGER_CLIENT_SECRET'),
    },
    authentication: {
      secret: configLoader.get('AUTH_SECRET'),
      accessTokenLifespanMs: ms(configLoader.get('ACCESS_TOKEN_LIFESPAN') || '20m'),
      refreshTokenLifespanMs: ms(configLoader.get('REFRESH_TOKEN_LIFESPAN') || '7d'),
      tokenForCampaignResultLifespan: configLoader.get('CAMPAIGN_RESULT_ACCESS_TOKEN_LIFESPAN') || '1h',
      tokenForStudentReconciliationLifespan: '1h',
      passwordResetTokenLifespan: '1h',
    },
    authenticationSession: {
      temporaryStorage: {
        expirationDelaySeconds:
          parseInt(configLoader.get('AUTHENTICATION_SESSION_TEMPORARY_STORAGE_EXP_DELAY_SECONDS'), 10) || 1140,
      },
    },
    availableCharacterForCode: {
      letters: 'BCDFGHJKMPQRTVWXY',
      numbers: '2346789',
    },
    bcryptNumberOfSaltRounds: _getNumber(configLoader.get('BCRYPT_NUMBER_OF_SALT_ROUNDS'), 10),
    caching: {
      redisUrl: configLoader.get('REDIS_URL'),
      redisCacheKeyLockTTL: parseInt(configLoader.get('REDIS_CACHE_KEY_LOCK_TTL'), 10) || 60000,
      redisCacheLockedWaitBeforeRetry: parseInt(configLoader.get('REDIS_CACHE_LOCKED_WAIT_BEFORE_RETRY'), 10) || 1000,
    },
    cnav: {
      isEnabledForPixAdmin: false,
      isEnabled: isFeatureEnabled(configLoader.get('CNAV_ENABLED')),
      clientId: configLoader.get('CNAV_CLIENT_ID'),
      authenticationUrl: configLoader.get('CNAV_AUTHENTICATION_URL'),
      userInfoUrl: configLoader.get('CNAV_OIDC_USER_INFO_URL'),
      tokenUrl: configLoader.get('CNAV_TOKEN_URL'),
      clientSecret: configLoader.get('CNAV_CLIENT_SECRET'),
      accessTokenLifespanMs: ms(configLoader.get('CNAV_ACCESS_TOKEN_LIFESPAN') || '7d'),
    },
    cpf: {
      idClient: '03VML243',
      idContrat: 'MCFCER000209',
      codeFranceConnect: 'RS5875',
      storage: {
        cpfExports: {
          client: {
            accessKeyId: configLoader.get('CPF_EXPORTS_STORAGE_ACCESS_KEY_ID'),
            secretAccessKey: configLoader.get('CPF_EXPORTS_STORAGE_SECRET_ACCESS_KEY'),
            endpoint: configLoader.get('CPF_EXPORTS_STORAGE_ENDPOINT'),
            region: configLoader.get('CPF_EXPORTS_STORAGE_REGION'),
            bucket: configLoader.get('CPF_EXPORTS_STORAGE_BUCKET_NAME'),
          },
          commands: {
            preSignedExpiresIn: configLoader.get('CPF_EXPORTS_STORAGE_PRE_SIGNED_EXPIRES_IN') || 604800,
          },
        },
        cpfReceipts: {
          client: {
            accessKeyId: configLoader.get('CPF_RECEIPTS_STORAGE_ACCESS_KEY_ID'),
            secretAccessKey: configLoader.get('CPF_RECEIPTS_STORAGE_SECRET_ACCESS_KEY'),
            endpoint: configLoader.get('CPF_RECEIPTS_STORAGE_ENDPOINT'),
            region: configLoader.get('CPF_RECEIPTS_STORAGE_REGION'),
            bucket: configLoader.get('CPF_RECEIPTS_STORAGE_BUCKET_NAME'),
          },
        },
      },
      plannerJob: {
        chunkSize: configLoader.get('CPF_PLANNER_JOB_CHUNK_SIZE') || 50000,
        monthsToProcess: _getNumber(configLoader.get('CPF_PLANNER_JOB_MONTHS_TO_PROCESS'), 1),
        minimumReliabilityPeriod: _getNumber(configLoader.get('CPF_PLANNER_JOB_MINIMUM_RELIABILITY_PERIOD'), 3),
        cron: configLoader.get('CPF_PLANNER_JOB_CRON') || '0 0 1 1 *',
      },
      sendEmailJob: {
        recipient: configLoader.get('CPF_SEND_EMAIL_JOB_RECIPIENT'),
        cron: configLoader.get('CPF_SEND_EMAIL_JOB_CRON') || '0 0 1 1 *',
      },
    },
    dataProtectionPolicy: {
      updateDate: configLoader.get('DATA_PROTECTION_POLICY_UPDATE_DATE') || null,
    },
    domain: {
      tldFr: configLoader.get('TLD_FR') || '.fr',
      tldOrg: configLoader.get('TLD_ORG') || '.org',
      pix: configLoader.get('DOMAIN_PIX') || 'https://pix',
      pixApp: configLoader.get('DOMAIN_PIX_APP') || 'https://app.pix',
      pixOrga: configLoader.get('DOMAIN_PIX_ORGA') || 'https://orga.pix',
      pixCertif: configLoader.get('DOMAIN_PIX_CERTIF') || 'https://certif.pix',
    },
    environment: configLoader.get('NODE_ENV') || 'development',
    features: {
      dayBeforeImproving: _getNumber(configLoader.get('DAY_BEFORE_IMPROVING'), 4),
      dayBeforeRetrying: _getNumber(configLoader.get('DAY_BEFORE_RETRYING'), 4),
      dayBeforeCompetenceResetV2: _getNumber(configLoader.get('DAY_BEFORE_COMPETENCE_RESET_V2'), 7),
      garAccessV2: isFeatureEnabled(configLoader.get('GAR_ACCESS_V2')),
      maxReachableLevel: _getNumber(configLoader.get('MAX_REACHABLE_LEVEL'), 5),
      newYearOrganizationLearnersImportDate: _getDate(configLoader.get('NEW_YEAR_ORGANIZATION_LEARNERS_IMPORT_DATE')),
      numberOfChallengesForFlashMethod: _getNumber(configLoader.get('NUMBER_OF_CHALLENGES_FOR_FLASH_METHOD')),
      successProbabilityThreshold: parseFloat(configLoader.get('SUCCESS_PROBABILITY_THRESHOLD') ?? '0.95'),
      pixCertifScoBlockedAccessWhitelist: getArrayOfUpperStrings(
        configLoader.get('PIX_CERTIF_SCO_BLOCKED_ACCESS_WHITELIST'),
      ),
      pixCertifScoBlockedAccessDateLycee: configLoader.get('PIX_CERTIF_SCO_BLOCKED_ACCESS_DATE_LYCEE'),
      pixCertifScoBlockedAccessDateCollege: configLoader.get('PIX_CERTIF_SCO_BLOCKED_ACCESS_DATE_COLLEGE'),
      scheduleComputeOrganizationLearnersCertificability: {
        cron: configLoader.get('SCHEDULE_COMPUTE_LEARNERS_CERTIFICABILITY_JOB_CRON') || '0 21 * * *',
        chunkSize: configLoader.get('SCHEDULE_COMPUTE_LEARNERS_CERTIFICABILITY_CHUNK_SIZE') || 50000,
      },
      scoAccountRecoveryKeyLifetimeMinutes: configLoader.get('SCO_ACCOUNT_RECOVERY_KEY_LIFETIME_MINUTES'),
    },
    featureToggles: {
      isAlwaysOkValidateNextChallengeEndpointEnabled: isFeatureEnabled(
        configLoader.get('FT_ALWAYS_OK_VALIDATE_NEXT_CHALLENGE_ENDPOINT'),
      ),
      isPix1dEnabled: isFeatureEnabled(configLoader.get('FT_PIX_1D_ENABLED')),
      isPixPlusLowerLeverEnabled: isFeatureEnabled(configLoader.get('FT_ENABLE_PIX_PLUS_LOWER_LEVEL')),
      isCertificationTokenScopeEnabled: isFeatureEnabled(configLoader.get('FT_ENABLE_CERTIF_TOKEN_SCOPE')),
    },
    fwb: {
      isEnabledForPixAdmin: false,
      isEnabled: isFeatureEnabled(configLoader.get('FWB_ENABLED')),
      clientId: configLoader.get('FWB_CLIENT_ID'),
      clientSecret: configLoader.get('FWB_CLIENT_SECRET'),
      tokenUrl: configLoader.get('FWB_TOKEN_URL'),
      authenticationUrl: configLoader.get('FWB_AUTHENTICATION_URL'),
      userInfoUrl: configLoader.get('FWB_USER_INFO_URL'),
      claimsToStore: getArrayOfStrings(configLoader.get('FWB_CLAIMS_TO_STORE')),
      accessTokenLifespanMs: ms(configLoader.get('FWB_ACCESS_TOKEN_LIFESPAN') || '7d'),
      logoutUrl: configLoader.get('FWB_OIDC_LOGOUT_URL'),
      temporaryStorage: {
        idTokenLifespanMs: ms(configLoader.get('FWB_ID_TOKEN_LIFESPAN') || '7d'),
      },
    },
    google: {
      isEnabled: false,
      isEnabledForPixAdmin: isFeatureEnabled(configLoader.get('GOOGLE_ENABLED_FOR_PIX_ADMIN')),
      clientId: configLoader.get('GOOGLE_CLIENT_ID'),
      clientSecret: configLoader.get('GOOGLE_CLIENT_SECRET'),
      tokenUrl: configLoader.get('GOOGLE_TOKEN_URL'),
      authenticationUrl: configLoader.get('GOOGLE_AUTHENTICATION_URL'),
      userInfoUrl: configLoader.get('GOOGLE_USER_INFO_URL'),
      accessTokenLifespanMs: ms(configLoader.get('GOOGLE_ACCESS_TOKEN_LIFESPAN') || '7d'),
    },
    hapi: {
      options: {},
      enableRequestMonitoring: isFeatureEnabled(configLoader.get('ENABLE_REQUEST_MONITORING')),
    },
    infra: {
      concurrencyForHeavyOperations: _getNumber(configLoader.get('INFRA_CONCURRENCY_HEAVY_OPERATIONS'), 2),
      chunkSizeForCampaignResultProcessing: _getNumber(
        configLoader.get('INFRA_CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING'),
        10,
      ),
      chunkSizeForOrganizationLearnerDataProcessing: _getNumber(
        configLoader.get('INFRA_CHUNK_SIZE_ORGANIZATION_LEARNER_DATA_PROCESSING'),
        1000,
      ),
    },
    jwtConfig: {
      livretScolaire: {
        secret: configLoader.get('LIVRET_SCOLAIRE_AUTH_SECRET'),
        tokenLifespan: configLoader.get('TOKEN_LIFE_SPAN') || '1h',
      },
      poleEmploi: {
        secret: configLoader.get('POLE_EMPLOI_AUTH_SECRET'),
        tokenLifespan: configLoader.get('TOKEN_LIFE_SPAN') || '1h',
      },
    },
    lcms: {
      url: _removeTrailingSlashFromUrl(
        configLoader.get('CYPRESS_LCMS_API_URL') || configLoader.get('LCMS_API_URL') || '',
      ),
      apiKey: configLoader.get('CYPRESS_LCMS_API_KEY') || configLoader.get('LCMS_API_KEY'),
    },
    logging: {
      enabled: isFeatureNotDisabled(configLoader.get('LOG_ENABLED')),
      logLevel: configLoader.get('LOG_LEVEL') || 'info',
      logForHumans: _getLogForHumans(),
      enableKnexPerformanceMonitoring: isFeatureEnabled(configLoader.get('ENABLE_KNEX_PERFORMANCE_MONITORING')),
      enableLogStartingEventDispatch: isFeatureEnabled(configLoader.get('LOG_STARTING_EVENT_DISPATCH')),
      enableLogEndingEventDispatch: isFeatureEnabled(configLoader.get('LOG_ENDING_EVENT_DISPATCH')),
      emitOpsEventEachSeconds: isFeatureEnabled(configLoader.get('OPS_EVENT_EACH_SECONDS')) || 15,
    },
    login: {
      temporaryBlockingThresholdFailureCount: _getNumber(
        configLoader.get('LOGIN_TEMPORARY_BLOCKING_THRESHOLD_FAILURE_COUNT') || 10,
      ),
      temporaryBlockingBaseTimeMs: ms(configLoader.get('LOGIN_TEMPORARY_BLOCKING_BASE_TIME') || '2m'),
      blockingLimitFailureCount: _getNumber(configLoader.get('LOGIN_BLOCKING_LIMIT_FAILURE_COUNT') || 50),
    },
    logOpsMetrics: isFeatureEnabled(configLoader.get('LOG_OPS_METRICS')),
    mailing: {
      enabled: isFeatureEnabled(configLoader.get('MAILING_ENABLED')),
      provider: configLoader.get('MAILING_PROVIDER') || 'brevo',
      smtpUrl: configLoader.get('MAILING_SMTP_URL') || 'smtp://username:password@localhost:1025/',
      brevo: {
        apiKey: configLoader.get('BREVO_API_KEY'),
        templates: {
          accountCreationTemplateId: configLoader.get('BREVO_ACCOUNT_CREATION_TEMPLATE_ID'),
          organizationInvitationTemplateId: configLoader.get('BREVO_ORGANIZATION_INVITATION_TEMPLATE_ID'),
          organizationInvitationScoTemplateId: configLoader.get('BREVO_ORGANIZATION_INVITATION_SCO_TEMPLATE_ID'),
          certificationCenterInvitationTemplateId: configLoader.get(
            'BREVO_CERTIFICATION_CENTER_INVITATION_TEMPLATE_ID',
          ),
          passwordResetTemplateId: configLoader.get('BREVO_PASSWORD_RESET_TEMPLATE_ID'),
          certificationResultTemplateId: configLoader.get('BREVO_CERTIFICATION_RESULT_TEMPLATE_ID'),
          accountRecoveryTemplateId: configLoader.get('BREVO_ACCOUNT_RECOVERY_TEMPLATE_ID'),
          emailVerificationCodeTemplateId: configLoader.get('BREVO_EMAIL_VERIFICATION_CODE_TEMPLATE_ID'),
          cpfEmailTemplateId: configLoader.get('BREVO_CPF_TEMPLATE_ID'),
          acquiredCleaResultTemplateId: configLoader.get('BREVO_CLEA_ACQUIRED_RESULT_TEMPLATE_ID'),
          targetProfileNotCertifiableTemplateId: configLoader.get('BREVO_TARGET_PROFILE_NOT_CERTIFIABLE_TEMPLATE_ID'),
        },
      },
    },
    partner: {
      fetchTimeOut: ms(configLoader.get('FETCH_TIMEOUT_MILLISECONDS') || '20s'),
    },
    paysdelaloire: {
      isEnabledForPixAdmin: false,
      isEnabled: isFeatureEnabled(configLoader.get('PAYSDELALOIRE_ENABLED')),
      clientId: configLoader.get('PAYSDELALOIRE_CLIENT_ID'),
      clientSecret: configLoader.get('PAYSDELALOIRE_CLIENT_SECRET'),
      tokenUrl: configLoader.get('PAYSDELALOIRE_TOKEN_URL'),
      userInfoUrl: configLoader.get('PAYSDELALOIRE_USER_INFO_URL'),
      authenticationUrl: configLoader.get('PAYSDELALOIRE_AUTHENTICATION_URL'),
      endSessionUrl: configLoader.get('PAYSDELALOIRE_END_SESSION_URL'),
      postLogoutRedirectUri: configLoader.get('PAYSDELALOIRE_POST_LOGOUT_REDIRECT_URI'),
      accessTokenLifespanMs: ms(configLoader.get('PAYSDELALOIRE_ACCESS_TOKEN_LIFESPAN') || '7d'),
      temporaryStorage: {
        idTokenLifespanMs: ms(configLoader.get('PAYSDELALOIRE_ID_TOKEN_LIFESPAN') || '7d'),
      },
    },
    pgBoss: {
      connexionPoolMaxSize: _getNumber(configLoader.get('PGBOSS_CONNECTION_POOL_MAX_SIZE'), 2),
      teamSize: _getNumber(configLoader.get('PG_BOSS_TEAM_SIZE'), 1),
      teamConcurrency: _getNumber(configLoader.get('PG_BOSS_TEAM_CONCURRENCY'), 1),
      monitorStateIntervalSeconds: _getNumber(configLoader.get('PGBOSS_MONITOR_STATE_INTERVAL_SECONDS'), undefined),
    },
    poleEmploi: {
      isEnabledForPixAdmin: false,
      isEnabled: isFeatureEnabled(configLoader.get('POLE_EMPLOI_ENABLED')),
      clientId: configLoader.get('POLE_EMPLOI_CLIENT_ID'),
      clientSecret: configLoader.get('POLE_EMPLOI_CLIENT_SECRET'),
      tokenUrl: configLoader.get('POLE_EMPLOI_TOKEN_URL'),
      sendingUrl: configLoader.get('POLE_EMPLOI_SENDING_URL'),
      userInfoUrl: configLoader.get('POLE_EMPLOI_OIDC_USER_INFO_URL'),
      authenticationUrl: configLoader.get('POLE_EMPLOI_OIDC_AUTHENTICATION_URL'),
      logoutUrl: configLoader.get('POLE_EMPLOI_OIDC_LOGOUT_URL'),
      afterLogoutUrl: configLoader.get('POLE_EMPLOI_OIDC_AFTER_LOGOUT_URL'),
      temporaryStorage: {
        idTokenLifespanMs: ms(configLoader.get('POLE_EMPLOI_ID_TOKEN_LIFESPAN') || '7d'),
      },
      poleEmploiSendingsLimit: _getNumber(configLoader.get('POLE_EMPLOI_SENDING_LIMIT'), 100),
      accessTokenLifespanMs: ms(configLoader.get('POLE_EMPLOI_ACCESS_TOKEN_LIFESPAN') || '7d'),
      pushEnabled: isFeatureEnabled(configLoader.get('PUSH_DATA_TO_POLE_EMPLOI_ENABLED')),
    },
    port: _getNumber(configLoader.get('PORT'), 3000),
    rootPath: path.normalize(__dirname + '/..'),
    saml: {
      spConfig: parseJSONEnv('SAML_SP_CONFIG'),
      idpConfig: parseJSONEnv('SAML_IDP_CONFIG'),
      attributeMapping: parseJSONEnv('SAML_ATTRIBUTE_MAPPING') || {
        samlId: 'IDO',
        firstName: 'PRE',
        lastName: 'NOM',
      },
      accessTokenLifespanMs: ms(configLoader.get('SAML_ACCESS_TOKEN_LIFESPAN') || '7d'),
    },
    sentry: {
      enabled: isFeatureEnabled(configLoader.get('SENTRY_ENABLED')),
      dsn: configLoader.get('SENTRY_DSN'),
      environment: configLoader.get('SENTRY_ENVIRONMENT') || 'development',
      maxBreadcrumbs: _getNumber(configLoader.get('SENTRY_MAX_BREADCRUMBS'), 100),
      debug: isFeatureEnabled(configLoader.get('SENTRY_DEBUG')),
      maxValueLength: 1000,
    },
    temporaryKey: {
      secret: configLoader.get('AUTH_SECRET'),
      tokenLifespan: '1d',
      payload: 'PixResetPassword',
    },
    temporarySessionsStorageForMassImport: {
      expirationDelaySeconds:
        parseInt(configLoader.get('SESSIONS_MASS_IMPORT_TEMPORARY_STORAGE_EXP_DELAY_SECONDS'), 10) || 7200,
    },
    temporaryStorage: {
      expirationDelaySeconds: parseInt(configLoader.get('TEMPORARY_STORAGE_EXPIRATION_DELAY_SECONDS'), 10) || 600,
      redisUrl: configLoader.get('REDIS_URL'),
    },
    v3Certification: {
      numberOfChallengesPerCourse: configLoader.get('V3_CERTIFICATION_NUMBER_OF_CHALLENGES_PER_COURSE') || 20,
      defaultProbabilityToPickChallenge: parseInt(configLoader.get('DEFAULT_PROBABILITY_TO_PICK_CHALLENGE'), 10) || 51,
      defaultCandidateCapacity: -3,
      challengesBetweenSameCompetence: 2,
      scoring: {
        minimumAnswersRequiredToValidateACertification: 20,
      },
    },
    version: configLoader.get('CONTAINER_VERSION') || 'development',
    autonomousCourse: {
      autonomousCoursesOrganizationId: parseInt(configLoader.get('AUTONOMOUS_COURSES_ORGANIZATION_ID'), 10),
    },
  };

  if (process.env.NODE_ENV === 'test') {
    config.domain.tldFr = '.fr';
    config.domain.tldOrg = '.org';
    config.domain.pix = 'https://pix';
    config.domain.pixOrga = 'https://orga.pix';

    config.features.dayBeforeRetrying = 4;
    config.features.dayBeforeImproving = 4;
    config.features.dayBeforeCompetenceResetV2 = 7;
    config.features.garAccessV2 = false;
    config.features.maxReachableLevel = 5;
    config.features.numberOfChallengesForFlashMethod = 10;
    config.features.pixCertifScoBlockedAccessDateLycee = null;
    config.features.pixCertifScoBlockedAccessDateCollege = null;

    config.featureToggles.isAlwaysOkValidateNextChallengeEndpointEnabled = false;
    config.featureToggles.isPix1dEnabled = true;
    config.featureToggles.isCertificationTokenScopeEnabled = false;

    config.mailing.enabled = false;
    config.mailing.provider = 'brevo';
    config.mailing.smtpUrl = 'smtp://username:password@localhost:1025/';

    config.mailing.brevo.apiKey = 'test-api-key';
    config.mailing.brevo.templates.accountCreationTemplateId = 'test-account-creation-template-id';
    config.mailing.brevo.templates.organizationInvitationTemplateId = 'test-organization-invitation-demand-template-id';
    config.mailing.brevo.templates.organizationInvitationScoTemplateId =
      'test-organization-invitation-sco-demand-template-id';
    config.mailing.brevo.templates.passwordResetTemplateId = 'test-password-reset-template-id';
    config.mailing.brevo.templates.emailChangeTemplateId = 'test-email-change-template-id';
    config.mailing.brevo.templates.accountRecoveryTemplateId = 'test-account-recovery-template-id';
    config.mailing.brevo.templates.emailVerificationCodeTemplateId = 'test-email-verification-code-template-id';
    config.mailing.brevo.templates.cpfEmailTemplateId = 'test-cpf-email-template-id';
    config.mailing.brevo.templates.acquiredCleaResultTemplateId = 'test-acquired-clea-result-template-id';
    config.mailing.brevo.templates.targetProfileNotCertifiableTemplateId =
      'test-target-profile-no-certifiable-template-id';
    config.mailing.brevo.templates.certificationResultTemplateId = 'test-certification-result-template-id';

    config.bcryptNumberOfSaltRounds = 1;

    config.authentication.secret = 'test-jwt-key';

    config.temporaryKey.secret = 'test-jwt-key';

    config.poleEmploi.isEnabled = true;
    config.poleEmploi.clientId = 'PIX_POLE_EMPLOI_CLIENT_ID';
    config.poleEmploi.clientSecret = 'PIX_POLE_EMPLOI_CLIENT_SECRET';
    config.poleEmploi.tokenUrl = 'http://tokenUrl.fr';
    config.poleEmploi.sendingUrl = 'http://sendingUrl.fr';
    config.poleEmploi.userInfoUrl = 'http://userInfoUrl.fr';
    config.poleEmploi.authenticationUrl = 'http://authurl.fr';
    config.poleEmploi.logoutUrl = 'http://logout-url.fr';
    config.poleEmploi.afterLogoutUrl = 'http://after-logout.url';
    config.poleEmploi.temporaryStorage.redisUrl = null;
    config.poleEmploi.pushEnabled = true;

    config.temporaryStorage.redisUrl = null;

    config.cnav.isEnabled = true;
    config.cnav.clientId = 'PIX_CNAV_CLIENT_ID';
    config.cnav.authenticationUrl = 'http://idp.cnav/auth';
    config.cnav.userInfoUrl = 'http://userInfoUrl.fr';
    config.cnav.tokenUrl = 'http://idp.cnav/token';
    config.cnav.clientSecret = 'PIX_CNAV_CLIENT_SECRET';

    config.fwb.isEnabled = false;
    config.fwb.logoutUrl = 'http://logout-url.org';

    config.google.isEnabled = false;
    config.google.isEnabledForPixAdmin = true;
    config.google.clientId = 'PIX_google_CLIENT_ID';
    config.google.authenticationUrl = 'http://idp.google/auth';
    config.google.userInfoUrl = 'http://userInfoUrl.fr';
    config.google.tokenUrl = 'http://idp.google/token';
    config.google.clientSecret = 'PIX_GOOGLE_CLIENT_SECRET';

    config.saml.accessTokenLifespanMs = 1000;

    config.apimRegisterApplicationsCredentials = [
      {
        clientId: 'apimOsmoseClientId',
        clientSecret: 'apimOsmoseClientSecret',
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
    };

    config.jwtConfig.livretScolaire = { secret: 'secretosmose', tokenLifespan: '1h' };
    config.jwtConfig.poleEmploi = { secret: 'secretPoleEmploi', tokenLifespan: '1h' };

    config.logging.enabled = isFeatureEnabled(configLoader.get('TEST_LOG_ENABLED'));
    config.logging.enableLogKnexQueries = false;
    config.logging.enableLogStartingEventDispatch = false;
    config.logging.enableLogEndingEventDispatch = false;

    config.caching.redisUrl = null;
    config.caching.redisCacheKeyLockTTL = 100;
    config.caching.redisCacheLockedWaitBeforeRetry = 1;

    config.sentry.enabled = false;

    config.redis = {
      url: configLoader.get('TEST_REDIS_URL'),
      database: 1,
    };

    config.dataProtectionPolicy.updateDate = '2022-12-25 00:00:01';

    config.partner.fetchTimeOut = '5ms';
  }

  return config;
})();

export { configuration as config };
