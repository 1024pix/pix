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
      url: process.env.CYPRESS_LCMS_API_URL || process.env.LCMS_API_URL,
      apiKey: process.env.CYPRESS_LCMS_API_KEY || process.env.LCMS_API_KEY,
    },

    logging: {
      enabled: isFeatureEnabled(process.env.LOG_ENABLED),
      colorEnabled: (process.env.NODE_ENV === 'development'),
      logLevel: (process.env.LOG_LEVEL || 'info'),
    },

    mailing: {
      enabled: isFeatureEnabled(process.env.MAILING_ENABLED),
      provider: process.env.MAILING_PROVIDER || 'mailjet', /* sendinblue */
      mailjet: {
        apiKey: process.env.MAILJET_API_KEY,
        apiSecret: process.env.MAILJET_API_SECRET,
        templates: {
          accountCreationTemplateId: process.env.MAILJET_ACCOUNT_CREATION_TEMPLATE_ID,
          organizationInvitationTemplateId: process.env.MAILJET_ORGANIZATION_INVITATION_TEMPLATE_ID,
          passwordResetTemplateId: process.env.MAILJET_PASSWORD_RESET_TEMPLATE_ID,
        },
      },
      sendinblue: {
        apiKey: process.env.SENDINBLUE_API_KEY,
        templates: {
          accountCreationTemplateId: process.env.SENDINBLUE_ACCOUNT_CREATION_TEMPLATE_ID,
          organizationInvitationTemplateId: process.env.SENDINBLUE_ORGANIZATION_INVITATION_TEMPLATE_ID,
          organizationInvitationScoTemplateId: process.env.SENDINBLUE_ORGANIZATION_INVITATION_SCO_TEMPLATE_ID,
          passwordResetTemplateId: process.env.SENDINBLUE_PASSWORD_RESET_TEMPLATE_ID,
          certificationResultTemplateId: process.env.SENDINBLUE_CERTIFICATION_RESULT_TEMPLATE_ID,
        },
      },
    },

    captcha: {
      enabled: isFeatureEnabled(process.env.RECAPTCHA_ENABLED),
      googleRecaptchaSecret: process.env.RECAPTCHA_KEY,
    },

    authentication: {
      secret: process.env.AUTH_SECRET,
      tokenLifespan: (process.env.TOKEN_LIFE_SPAN || '7d'),
      tokenForCampaignResultLifespan: '1h',
      tokenForStudentReconciliationLifespan: '1h',
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
      dayBeforeCompetenceResetV2: _getNumber(process.env.DAY_BEFORE_COMPETENCE_RESET_V2,7),
      garAccessV2: isFeatureEnabled(process.env.GAR_ACCESS_V2),
      newYearSchoolingRegistrationsImportDate: _getDate(process.env.NEW_YEAR_SCHOOLING_REGISTRATIONS_IMPORT_DATE),
    },

    featureToggles: {
      certifPrescriptionSco: isFeatureEnabled(process.env.FT_CERTIF_PRESCRIPTION_SCO),
      isPoleEmploiEnabled: isFeatureEnabled(process.env.IS_POLE_EMPLOI_ENABLED),
      reportsCategorization: isFeatureEnabled(process.env.FT_REPORTS_CATEGORISATION),
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
      clientSecret: process.env.POLE_EMPLOI_CLIENT_SECRET,
      tokenUrl: process.env.POLE_EMPLOI_TOKEN_URL,
      userInfoUrl: process.env.POLE_EMPLOI_USER_INFO_URL,
    },
  };

  if (process.env.NODE_ENV === 'test') {
    config.port = 0;

    config.lcms.apiKey = 'test-api-key';
    config.lcms.url = 'https://lcms-test.pix.fr/api';

    config.domain.tldFr = '.fr';
    config.domain.tldOrg = '.org';
    config.domain.pix = 'https://pix';
    config.domain.pixOrga = 'https://orga.pix';

    config.features.dayBeforeImproving = 4;
    config.features.dayBeforeCompetenceResetV2 = 7;
    config.features.garAccessV2 = false;

    config.featureToggles.certifPrescriptionSco = false;
    config.featureToggles.reportsCategorization = false;

    config.mailing.enabled = false;
    config.mailing.provider = 'sendinblue';
    config.mailing.mailjet.apiKey = 'test-api-key';
    config.mailing.mailjet.apiSecret = 'test-api-secret';
    config.mailing.mailjet.templates.accountCreationTemplateId = 'test-account-creation-template-id';
    config.mailing.mailjet.templates.organizationInvitationTemplateId = 'test-organization-invitation-demand-template-id';
    config.mailing.mailjet.templates.passwordResetTemplateId = 'test-password-reset-template-id';

    config.mailing.sendinblue.apiKey = 'test-api-key';
    config.mailing.sendinblue.templates.accountCreationTemplateId = 'test-account-creation-template-id';
    config.mailing.sendinblue.templates.organizationInvitationTemplateId = 'test-organization-invitation-demand-template-id';
    config.mailing.sendinblue.templates.organizationInvitationScoTemplateId = 'test-organization-invitation-sco-demand-template-id';
    config.mailing.sendinblue.templates.certificationResultTemplateId = 'test-certification-result-template-id';

    config.mailing.sendinblue.templates.passwordResetTemplateId = 'test-password-reset-template-id';

    config.captcha.enabled = false;
    config.captcha.googleRecaptchaSecret = 'test-recaptcha-key';

    config.authentication.secret = 'test-jwt-key';
    config.authentication.tokenLifespan = '1d';

    config.temporaryKey.secret = 'test-jwt-key';

    config.poleEmploi.clientSecret = 'PIX_POLE_EMPLOI_CLIENT_SECRET';
    config.poleEmploi.tokenUrl = 'http://tokenUrl.fr';
    config.poleEmploi.userInfoUrl = 'http://userInfoUrl.fr';

    config.logging.enabled = false;

    config.caching.redisUrl = null;
    config.caching.redisCacheKeyLockTTL = 0;
    config.caching.redisCacheLockedWaitBeforeRetry = 0;

    config.sentry.enabled = false;
  }

  return config;

})();
