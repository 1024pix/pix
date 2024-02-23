import * as dotenv from 'dotenv';
import path from 'path';
import ms from 'ms';

import { getArrayOfStrings, getArrayOfUpperStrings } from './infrastructure/utils/string-utils.js';

import * as url from 'url';
import dayjs from 'dayjs';

dotenv.config();

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function parseJSONEnv(varName) {
  if (process.env[varName]) {
    return JSON.parse(process.env[varName]);
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
  const forceJSONLogs = process.env.LOG_FOR_HUMANS === 'false';
  return processOutputingToTerminal && !forceJSONLogs;
}

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
    ],
    auditLogger: {
      isEnabled: isFeatureEnabled(process.env.PIX_AUDIT_LOGGER_ENABLED),
      baseUrl: process.env.PIX_AUDIT_LOGGER_BASE_URL,
      clientSecret: process.env.PIX_AUDIT_LOGGER_CLIENT_SECRET,
    },
    authentication: {
      secret: process.env.AUTH_SECRET,
      accessTokenLifespanMs: ms(process.env.ACCESS_TOKEN_LIFESPAN || '20m'),
      refreshTokenLifespanMs: ms(process.env.REFRESH_TOKEN_LIFESPAN || '7d'),
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
    availableCharacterForCode: {
      letters: 'BCDFGHJKMPQRTVWXY',
      numbers: '2346789',
    },
    bcryptNumberOfSaltRounds: _getNumber(process.env.BCRYPT_NUMBER_OF_SALT_ROUNDS, 10),
    caching: {
      redisUrl: process.env.REDIS_URL,
      redisCacheKeyLockTTL: parseInt(process.env.REDIS_CACHE_KEY_LOCK_TTL, 10) || 60000,
      redisCacheLockedWaitBeforeRetry: parseInt(process.env.REDIS_CACHE_LOCKED_WAIT_BEFORE_RETRY, 10) || 1000,
    },
    cnav: {
      accessTokenLifespanMs: ms(process.env.CNAV_ACCESS_TOKEN_LIFESPAN || '7d'),
      authenticationUrl: process.env.CNAV_AUTHENTICATION_URL,
      clientId: process.env.CNAV_CLIENT_ID,
      clientSecret: process.env.CNAV_CLIENT_SECRET,
      isEnabled: isFeatureEnabled(process.env.CNAV_ENABLED),
      isEnabledForPixAdmin: false,
      openidConfigurationUrl: process.env.CNAV_OPENID_CONFIGURATION_URL,
      redirectUri: process.env.CNAV_REDIRECT_URI,
      tokenUrl: process.env.CNAV_TOKEN_URL,
      userInfoUrl: process.env.CNAV_OIDC_USER_INFO_URL,
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
      garAccessV2: isFeatureEnabled(process.env.GAR_ACCESS_V2),
      maxReachableLevel: _getNumber(process.env.MAX_REACHABLE_LEVEL, 5),
      newYearOrganizationLearnersImportDate: _getDate(process.env.NEW_YEAR_ORGANIZATION_LEARNERS_IMPORT_DATE),
      numberOfChallengesForFlashMethod: _getNumber(process.env.NUMBER_OF_CHALLENGES_FOR_FLASH_METHOD),
      successProbabilityThreshold: parseFloat(process.env.SUCCESS_PROBABILITY_THRESHOLD ?? '0.95'),
      pixCertifScoBlockedAccessWhitelist: getArrayOfUpperStrings(process.env.PIX_CERTIF_SCO_BLOCKED_ACCESS_WHITELIST),
      pixCertifScoBlockedAccessDateLycee: process.env.PIX_CERTIF_SCO_BLOCKED_ACCESS_DATE_LYCEE,
      pixCertifScoBlockedAccessDateCollege: process.env.PIX_CERTIF_SCO_BLOCKED_ACCESS_DATE_COLLEGE,
      scheduleComputeOrganizationLearnersCertificability: {
        cron: process.env.SCHEDULE_COMPUTE_LEARNERS_CERTIFICABILITY_JOB_CRON || '0 21 * * *',
        chunkSize: process.env.SCHEDULE_COMPUTE_LEARNERS_CERTIFICABILITY_CHUNK_SIZE || 50000,
      },
      scoAccountRecoveryKeyLifetimeMinutes: process.env.SCO_ACCOUNT_RECOVERY_KEY_LIFETIME_MINUTES,
    },
    featureToggles: {
      isAlwaysOkValidateNextChallengeEndpointEnabled: isFeatureEnabled(
        process.env.FT_ALWAYS_OK_VALIDATE_NEXT_CHALLENGE_ENDPOINT,
      ),
      isPix1dEnabled: isFeatureEnabled(process.env.FT_PIX_1D_ENABLED),
      isPixPlusLowerLeverEnabled: isFeatureEnabled(process.env.FT_ENABLE_PIX_PLUS_LOWER_LEVEL),
      isCertificationTokenScopeEnabled: isFeatureEnabled(process.env.FT_ENABLE_CERTIF_TOKEN_SCOPE),
    },
    fwb: {
      accessTokenLifespanMs: ms(process.env.FWB_ACCESS_TOKEN_LIFESPAN || '7d'),
      authenticationUrl: process.env.FWB_AUTHENTICATION_URL,
      claimsToStore: getArrayOfStrings(process.env.FWB_CLAIMS_TO_STORE),
      clientId: process.env.FWB_CLIENT_ID,
      clientSecret: process.env.FWB_CLIENT_SECRET,
      isEnabled: isFeatureEnabled(process.env.FWB_ENABLED),
      isEnabledForPixAdmin: false,
      logoutUrl: process.env.FWB_OIDC_LOGOUT_URL,
      openidConfigurationUrl: process.env.FWB_OPENID_CONFIGURATION_URL,
      redirectUri: process.env.FWB_REDIRECT_URI,
      temporaryStorage: { idTokenLifespanMs: ms(process.env.FWB_ID_TOKEN_LIFESPAN || '7d') },
      tokenUrl: process.env.FWB_TOKEN_URL,
      userInfoUrl: process.env.FWB_USER_INFO_URL,
    },
    google: {
      accessTokenLifespanMs: ms(process.env.GOOGLE_ACCESS_TOKEN_LIFESPAN || '7d'),
      authenticationUrl: process.env.GOOGLE_AUTHENTICATION_URL,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      isEnabled: false,
      isEnabledForPixAdmin: isFeatureEnabled(process.env.GOOGLE_ENABLED_FOR_PIX_ADMIN),
      tokenUrl: process.env.GOOGLE_TOKEN_URL,
      userInfoUrl: process.env.GOOGLE_USER_INFO_URL,
    },
    hapi: {
      options: {},
      enableRequestMonitoring: isFeatureEnabled(process.env.ENABLE_REQUEST_MONITORING),
    },
    infra: {
      concurrencyForHeavyOperations: _getNumber(process.env.INFRA_CONCURRENCY_HEAVY_OPERATIONS, 2),
      chunkSizeForCampaignResultProcessing: _getNumber(process.env.INFRA_CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING, 10),
      chunkSizeForOrganizationLearnerDataProcessing: _getNumber(
        process.env.INFRA_CHUNK_SIZE_ORGANIZATION_LEARNER_DATA_PROCESSING,
        1000,
      ),
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
    lcms: {
      url: _removeTrailingSlashFromUrl(process.env.CYPRESS_LCMS_API_URL || process.env.LCMS_API_URL || ''),
      apiKey: process.env.CYPRESS_LCMS_API_KEY || process.env.LCMS_API_KEY,
    },
    logging: {
      enabled: isFeatureNotDisabled(process.env.LOG_ENABLED),
      logLevel: process.env.LOG_LEVEL || 'info',
      logForHumans: _getLogForHumans(),
      enableKnexPerformanceMonitoring: isFeatureEnabled(process.env.ENABLE_KNEX_PERFORMANCE_MONITORING),
      enableLogStartingEventDispatch: isFeatureEnabled(process.env.LOG_STARTING_EVENT_DISPATCH),
      enableLogEndingEventDispatch: isFeatureEnabled(process.env.LOG_ENDING_EVENT_DISPATCH),
      emitOpsEventEachSeconds: isFeatureEnabled(process.env.OPS_EVENT_EACH_SECONDS) || 15,
    },
    login: {
      temporaryBlockingThresholdFailureCount: _getNumber(
        process.env.LOGIN_TEMPORARY_BLOCKING_THRESHOLD_FAILURE_COUNT || 10,
      ),
      temporaryBlockingBaseTimeMs: ms(process.env.LOGIN_TEMPORARY_BLOCKING_BASE_TIME || '2m'),
      blockingLimitFailureCount: _getNumber(process.env.LOGIN_BLOCKING_LIMIT_FAILURE_COUNT || 50),
    },
    logOpsMetrics: isFeatureEnabled(process.env.LOG_OPS_METRICS),
    mailing: {
      enabled: isFeatureEnabled(process.env.MAILING_ENABLED),
      provider: process.env.MAILING_PROVIDER || 'brevo',
      smtpUrl: process.env.MAILING_SMTP_URL || 'smtp://username:password@localhost:1025/',
      brevo: {
        apiKey: process.env.BREVO_API_KEY,
        templates: {
          accountCreationTemplateId: process.env.BREVO_ACCOUNT_CREATION_TEMPLATE_ID,
          organizationInvitationTemplateId: process.env.BREVO_ORGANIZATION_INVITATION_TEMPLATE_ID,
          organizationInvitationScoTemplateId: process.env.BREVO_ORGANIZATION_INVITATION_SCO_TEMPLATE_ID,
          certificationCenterInvitationTemplateId: process.env.BREVO_CERTIFICATION_CENTER_INVITATION_TEMPLATE_ID,
          passwordResetTemplateId: process.env.BREVO_PASSWORD_RESET_TEMPLATE_ID,
          certificationResultTemplateId: process.env.BREVO_CERTIFICATION_RESULT_TEMPLATE_ID,
          accountRecoveryTemplateId: process.env.BREVO_ACCOUNT_RECOVERY_TEMPLATE_ID,
          emailVerificationCodeTemplateId: process.env.BREVO_EMAIL_VERIFICATION_CODE_TEMPLATE_ID,
          cpfEmailTemplateId: process.env.BREVO_CPF_TEMPLATE_ID,
          acquiredCleaResultTemplateId: process.env.BREVO_CLEA_ACQUIRED_RESULT_TEMPLATE_ID,
          targetProfileNotCertifiableTemplateId: process.env.BREVO_TARGET_PROFILE_NOT_CERTIFIABLE_TEMPLATE_ID,
        },
      },
    },
    partner: {
      fetchTimeOut: ms(process.env.FETCH_TIMEOUT_MILLISECONDS || '20s'),
    },
    paysdelaloire: {
      accessTokenLifespanMs: ms(process.env.PAYSDELALOIRE_ACCESS_TOKEN_LIFESPAN || '7d'),
      authenticationUrl: process.env.PAYSDELALOIRE_AUTHENTICATION_URL,
      clientId: process.env.PAYSDELALOIRE_CLIENT_ID,
      clientSecret: process.env.PAYSDELALOIRE_CLIENT_SECRET,
      endSessionUrl: process.env.PAYSDELALOIRE_END_SESSION_URL,
      isEnabled: isFeatureEnabled(process.env.PAYSDELALOIRE_ENABLED),
      isEnabledForPixAdmin: false,
      openidConfigurationUrl: process.env.PAYSDELALOIRE_OPENID_CONFIGURATION_URL,
      postLogoutRedirectUri: process.env.PAYSDELALOIRE_POST_LOGOUT_REDIRECT_URI,
      redirectUri: process.env.PAYSDELALOIRE_REDIRECT_URI,
      temporaryStorage: { idTokenLifespanMs: ms(process.env.PAYSDELALOIRE_ID_TOKEN_LIFESPAN || '7d') },
      tokenUrl: process.env.PAYSDELALOIRE_TOKEN_URL,
      userInfoUrl: process.env.PAYSDELALOIRE_USER_INFO_URL,
    },
    pgBoss: {
      connexionPoolMaxSize: _getNumber(process.env.PGBOSS_CONNECTION_POOL_MAX_SIZE, 2),
      teamSize: _getNumber(process.env.PG_BOSS_TEAM_SIZE, 1),
      teamConcurrency: _getNumber(process.env.PG_BOSS_TEAM_CONCURRENCY, 1),
      monitorStateIntervalSeconds: _getNumber(process.env.PGBOSS_MONITOR_STATE_INTERVAL_SECONDS, undefined),
    },
    poleEmploi: {
      accessTokenLifespanMs: ms(process.env.POLE_EMPLOI_ACCESS_TOKEN_LIFESPAN || '7d'),
      afterLogoutUrl: process.env.POLE_EMPLOI_OIDC_AFTER_LOGOUT_URL,
      authenticationUrl: process.env.POLE_EMPLOI_OIDC_AUTHENTICATION_URL,
      clientId: process.env.POLE_EMPLOI_CLIENT_ID,
      clientSecret: process.env.POLE_EMPLOI_CLIENT_SECRET,
      isEnabled: isFeatureEnabled(process.env.POLE_EMPLOI_ENABLED),
      isEnabledForPixAdmin: false,
      logoutUrl: process.env.POLE_EMPLOI_OIDC_LOGOUT_URL,
      openidConfigurationUrl: process.env.POLE_EMPLOI_OPENID_CONFIGURATION_URL,
      poleEmploiSendingsLimit: _getNumber(process.env.POLE_EMPLOI_SENDING_LIMIT, 100),
      pushEnabled: isFeatureEnabled(process.env.PUSH_DATA_TO_POLE_EMPLOI_ENABLED),
      redirectUri: process.env.POLE_EMPLOI_REDIRECT_URI,
      sendingUrl: process.env.POLE_EMPLOI_SENDING_URL,
      temporaryStorage: { idTokenLifespanMs: ms(process.env.POLE_EMPLOI_ID_TOKEN_LIFESPAN || '7d') },
      tokenUrl: process.env.POLE_EMPLOI_TOKEN_URL,
      userInfoUrl: process.env.POLE_EMPLOI_OIDC_USER_INFO_URL,
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
    sentry: {
      enabled: isFeatureEnabled(process.env.SENTRY_ENABLED),
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || 'development',
      maxBreadcrumbs: _getNumber(process.env.SENTRY_MAX_BREADCRUMBS, 100),
      debug: isFeatureEnabled(process.env.SENTRY_DEBUG),
      maxValueLength: 1000,
    },
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
    v3Certification: {
      numberOfChallengesPerCourse: process.env.V3_CERTIFICATION_NUMBER_OF_CHALLENGES_PER_COURSE || 20,
      defaultProbabilityToPickChallenge: parseInt(process.env.DEFAULT_PROBABILITY_TO_PICK_CHALLENGE, 10) || 51,
      defaultCandidateCapacity: -3,
      challengesBetweenSameCompetence: 2,
      scoring: {
        minimumAnswersRequiredToValidateACertification: 20,
      },
    },
    version: process.env.CONTAINER_VERSION || 'development',
    autonomousCourse: {
      autonomousCoursesOrganizationId: parseInt(process.env.AUTONOMOUS_COURSES_ORGANIZATION_ID, 10),
    },
  };

  if (process.env.NODE_ENV === 'test') {
    config.oidcExampleNet = {
      authenticationUrl: 'https://oidc.example.net/authentication',
      clientId: 'client',
      clientSecret: 'secret',
      isEnabled: true,
      temporaryStorage: {
        idTokenLifespanMs: ms('1d'),
      },
      tokenUrl: 'https://oidc.example.net/token',
      userInfoUrl: 'https://oidc.example.net/userinfo',
      openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
      organizationName: 'Oidc Example',
      postLogoutRedirectUri: 'https://app.dev.pix.local/connexion',
      redirectUri: 'https://app.dev.pix.local/connexion/oidc-example-net',
    };

    config.auditLogger.baseUrl = 'http://audit-logger.local';
    config.auditLogger.clientSecret = 'client-super-secret';

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
    config.mailing.brevo.templates.certificationResultTemplateId = 'test-certification-result-template-id';
    config.mailing.brevo.templates.passwordResetTemplateId = 'test-password-reset-template-id';
    config.mailing.brevo.templates.emailChangeTemplateId = 'test-email-change-template-id';
    config.mailing.brevo.templates.accountRecoveryTemplateId = 'test-account-recovery-template-id';
    config.mailing.brevo.templates.emailVerificationCodeTemplateId = 'test-email-verification-code-template-id';
    config.mailing.brevo.templates.cpfEmailTemplateId = 'test-cpf-email-template-id';
    config.mailing.brevo.templates.acquiredCleaResultTemplateId = 'test-acquired-clea-result-template-id';
    config.mailing.brevo.templates.targetProfileNotCertifiableTemplateId =
      'test-target-profile-no-certifiable-template-id';

    config.bcryptNumberOfSaltRounds = 1;

    config.authentication.secret = 'the-password-must-be-at-least-32-characters-long';

    config.temporaryKey.secret = 'the-password-must-be-at-least-32-characters-long';

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

    config.logging.enabled = isFeatureEnabled(process.env.TEST_LOG_ENABLED);
    config.logging.enableLogKnexQueries = false;
    config.logging.enableLogStartingEventDispatch = false;
    config.logging.enableLogEndingEventDispatch = false;

    config.caching.redisUrl = null;
    config.caching.redisCacheKeyLockTTL = 100;
    config.caching.redisCacheLockedWaitBeforeRetry = 1;

    config.sentry.enabled = false;

    config.redis = {
      url: process.env.TEST_REDIS_URL,
      database: 1,
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
  }

  return config;
})();

export { configuration as config };
