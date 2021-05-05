const path = require('path');
const moment = require('moment');

function parseJSONEnv(varName) {
  if (process.env[varName]) {
    return JSON.parse(process.env[varName]);
  }
  return undefined;
}

function isFeatureEnabled(environmentVariable) {
  return environmentVariable === 'true';
}

function _getNumber(numberAsString, defaultIntNumber) {
  const number = parseInt(numberAsString, 10);
  return isNaN(number) ? defaultIntNumber : number;
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

module.exports = (function() {

  const config = {
    rootPath: path.normalize(__dirname + '/..'),

    port: parseInt(process.env.PORT, 10) || 3000,

    environment: (process.env.NODE_ENV || 'development'),

    hapi: {
      options: {},
    },

    domain: {
      tldFr: process.env.TLD_FR || '.fr',
      tldOrg: process.env.TLD_ORG || '.org',
      pix: process.env.DOMAIN_PIX || 'https://pix',
      pixApp: process.env.DOMAIN_PIX_APP || 'https://app.pix',
      pixOrga: process.env.DOMAIN_PIX_ORGA || 'https://orga.pix',
    },

    lcms: {
      url: _removeTrailingSlashFromUrl(process.env.CYPRESS_LCMS_API_URL || process.env.LCMS_API_URL || ''),
      apiKey: process.env.CYPRESS_LCMS_API_KEY || process.env.LCMS_API_KEY,
    },

    logging: {
      enabled: isFeatureEnabled(process.env.LOG_ENABLED),
      colorEnabled: (process.env.NODE_ENV === 'development'),
      logLevel: (process.env.LOG_LEVEL || 'info'),
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
          passwordResetTemplateId: process.env.SENDINBLUE_PASSWORD_RESET_TEMPLATE_ID,
          certificationResultTemplateId: process.env.SENDINBLUE_CERTIFICATION_RESULT_TEMPLATE_ID,
          emailChangeTemplateId: process.env.SENDINBLUE_EMAIL_CHANGE_TEMPLATE_ID,
        },
      },
    },

    authentication: {
      secret: process.env.AUTH_SECRET,
      tokenLifespan: (process.env.TOKEN_LIFE_SPAN || '7d'),
      tokenForCampaignResultLifespan: '1h',
      tokenForStudentReconciliationLifespan: '1h',
    },

    livretScolaireAuthentication: {
      secret: process.env.LIVRET_SCOLAIRE_AUTH_SECRET,
      tokenLifespan: (process.env.TOKEN_LIFE_SPAN || '1h'),
    },

    saml: {
      spConfig: parseJSONEnv('SAML_SP_CONFIG'),
      idpConfig: parseJSONEnv('SAML_IDP_CONFIG'),
      attributeMapping: parseJSONEnv('SAML_ATTRIBUTE_MAPPING') || {
        samlId: 'IDO',
        firstName: 'PRE',
        lastName: 'NOM',
      },
    },

    temporaryKey: {
      secret: process.env.AUTH_SECRET,
      tokenLifespan: '1d',
      payload: 'PixResetPassword',
    },

    account: {
      passwordValidationPattern: '^(?=.*\\p{Lu})(?=.*\\p{Ll})(?=.*\\d).{8,}$',
    },

    caching: {
      redisUrl: process.env.REDIS_URL,
      redisCacheKeyLockTTL: parseInt(process.env.REDIS_CACHE_KEY_LOCK_TTL, 10) || 60000,
      redisCacheLockedWaitBeforeRetry: parseInt(process.env.REDIS_CACHE_LOCKED_WAIT_BEFORE_RETRY, 10) || 1000,
    },

    features: {
      dayBeforeImproving: _getNumber(process.env.DAY_BEFORE_IMPROVING, 4),
      dayBeforeRetrying: _getNumber(process.env.DAY_BEFORE_RETRYING, 4),
      dayBeforeCompetenceResetV2: _getNumber(process.env.DAY_BEFORE_COMPETENCE_RESET_V2, 7),
      garAccessV2: isFeatureEnabled(process.env.GAR_ACCESS_V2),
      maxReachableLevel: _getNumber(process.env.MAX_REACHABLE_LEVEL, 5),
      newYearSchoolingRegistrationsImportDate: _getDate(process.env.NEW_YEAR_SCHOOLING_REGISTRATIONS_IMPORT_DATE),
    },

    featureToggles: {
      isNeutralizationAutoEnabled: isFeatureEnabled(process.env.FT_IS_NEUTRALIZATION_AUTO_ENABLED),
      isPoleEmploiEnabled: isFeatureEnabled(process.env.IS_POLE_EMPLOI_ENABLED),
      isCertificationResultsInOrgaEnabled: isFeatureEnabled(process.env.FT_IS_CERTIFICATION_RESULTS_IN_ORGA_ENABLED),
    },

    infra: {
      concurrencyForHeavyOperations: _getNumber(process.env.INFRA_CONCURRENCY_HEAVY_OPERATIONS, 2),
      chunkSizeForCampaignResultProcessing: _getNumber(process.env.INFRA_CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING, 10),
      chunkSizeForSchoolingRegistrationDataProcessing: _getNumber(process.env.INFRA_CHUNK_SIZE_SCHOOLING_REGISTRATION_DATA_PROCESSING, 1000),
    },

    sentry: {
      enabled: isFeatureEnabled(process.env.SENTRY_ENABLED),
      dsn: process.env.SENTRY_DSN,
      environment: (process.env.SENTRY_ENVIRONMENT || 'development'),
      maxBreadcrumbs: _getNumber(process.env.SENTRY_MAX_BREADCRUMBS, 100),
      debug: isFeatureEnabled(process.env.SENTRY_DEBUG),
      maxValueLength: 1000,
    },

    poleEmploi: {
      clientId: process.env.POLE_EMPLOI_CLIENT_ID,
      clientSecret: process.env.POLE_EMPLOI_CLIENT_SECRET,
      tokenUrl: process.env.POLE_EMPLOI_TOKEN_URL,
      sendingUrl: process.env.POLE_EMPLOI_SENDING_URL,
      userInfoUrl: process.env.POLE_EMPLOI_USER_INFO_URL,
    },

    graviteeRegisterApplicationsCredentials: [
      {
        clientId: process.env.LSU_CLIENT_ID,
        clientSecret: process.env.LSU_CLIENT_SECRET,
        scope: 'organizations-certifications-result',
        source: 'lsu',
      },
      {
        clientId: process.env.LSL_CLIENT_ID,
        clientSecret: process.env.LSL_CLIENT_SECRET,
        scope: 'organizations-certifications-result',
        source: 'lsl',
      },
      {
        clientId: process.env.GRAVITEE_OSMOSE_CLIENT_ID,
        clientSecret: process.env.GRAVITEE_OSMOSE_CLIENT_SECRET,
        scope: 'organizations-certifications-result',
        source: 'osmose',
      },
    ],
  };

  if (process.env.NODE_ENV === 'test') {
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

    config.featureToggles.isCertificationResultsInOrgaEnabled = false;

    config.mailing.enabled = false;
    config.mailing.provider = 'sendinblue';

    config.mailing.sendinblue.apiKey = 'test-api-key';
    config.mailing.sendinblue.templates.accountCreationTemplateId = 'test-account-creation-template-id';
    config.mailing.sendinblue.templates.organizationInvitationTemplateId = 'test-organization-invitation-demand-template-id';
    config.mailing.sendinblue.templates.organizationInvitationScoTemplateId = 'test-organization-invitation-sco-demand-template-id';
    config.mailing.sendinblue.templates.certificationResultTemplateId = 'test-certification-result-template-id';
    config.mailing.sendinblue.templates.passwordResetTemplateId = 'test-password-reset-template-id';
    config.mailing.sendinblue.templates.emailChangeTemplateId = 'test-email-change-template-id';

    config.authentication.secret = 'test-jwt-key';
    config.livretScolaireAuthentication.secret = 'test-livret-scolaire-secret';
    config.authentication.tokenLifespan = '1d';

    config.temporaryKey.secret = 'test-jwt-key';

    config.poleEmploi.clientSecret = 'PIX_POLE_EMPLOI_CLIENT_SECRET';
    config.poleEmploi.tokenUrl = 'http://tokenUrl.fr';
    config.poleEmploi.sendingUrl = 'http://sendingUrl.fr';
    config.poleEmploi.userInfoUrl = 'http://userInfoUrl.fr';

    config.graviteeRegisterApplicationsCredentials = [
      { clientId: 'lsuClientId', clientSecret: 'lsuClientSecret', scope: 'organizations-certifications-result', source: 'lsu' },
      { clientId: 'lslClientId', clientSecret: 'lslClientSecret', scope: 'organizations-certifications-result', source: 'lsl' },
      { clientId: 'graviteeOsmoseClientId', clientSecret: 'graviteeOsmoseClientSecret', scope: 'organizations-certifications-result', source: 'ósmose' },
    ];

    config.logging.enabled = false;

    config.caching.redisUrl = null;
    config.caching.redisCacheKeyLockTTL = 0;
    config.caching.redisCacheLockedWaitBeforeRetry = 0;

    config.sentry.enabled = false;
  }

  return config;

})();
