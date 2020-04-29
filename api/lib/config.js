const path = require('path');

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

module.exports = (function() {

  const config = {
    rootPath: path.normalize(__dirname + '/..'),

    port: parseInt(process.env.PORT, 10) || 3000,

    environment: (process.env.NODE_ENV || 'development'),

    hapi: {
      options: {}
    },

    airtable: {
      apiKey: process.env.AIRTABLE_API_KEY,
      base: process.env.AIRTABLE_BASE,
    },

    app: {
      domain: 'app.pix.fr'
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
          passwordResetTemplateId: process.env.MAILJET_PASSWORD_RESET_TEMPLATE_ID
        },
      },
      sendinblue: {
        apiKey: process.env.SENDINBLUE_API_KEY,
        templates: {
          accountCreationTemplateId: process.env.SENDINBLUE_ACCOUNT_CREATION_TEMPLATE_ID,
          organizationInvitationTemplateId: process.env.SENDINBLUE_ORGANIZATION_INVITATION_TEMPLATE_ID,
          passwordResetTemplateId: process.env.SENDINBLUE_PASSWORD_RESET_TEMPLATE_ID
        },
      },
    },

    captcha: {
      enabled: isFeatureEnabled(process.env.RECAPTCHA_ENABLED),
      googleRecaptchaSecret: process.env.RECAPTCHA_KEY
    },

    authentication: {
      secret: process.env.AUTH_SECRET,
      tokenLifespan: (process.env.TOKEN_LIFE_SPAN || '7d'),
      tokenForCampaignResultLifespan: '1h',
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
      payload: 'PixResetPassword'
    },

    account: {
      passwordValidationPattern: '^(?=.*\\p{Lu})(?=.*\\p{Ll})(?=.*\\d).{8,}$',
    },

    caching: {
      redisUrl: process.env.REDIS_URL,
      redisCacheKeyLockTTL: parseInt(process.env.REDIS_CACHE_KEY_LOCK_TTL, 10) || 60000,
      redisCacheLockedWaitBeforeRetry: parseInt(process.env.REDIS_CACHE_LOCKED_WAIT_BEFORE_RETRY, 10) || 1000,
    },

    system: {
      samplingHeapProfilerEnabled: (process.env.SYSTEM_SAMPLING_HEAP_PROFILER_ENABLED === 'true'),
    },

    features: {
      dayBeforeImproving: _getNumber(process.env.DAY_BEFORE_IMPROVING, 4),
      dayBeforeCompetenceResetV2: _getNumber(process.env.DAY_BEFORE_COMPETENCE_RESET_V2,7),
    },

    pixOrgaUrl: process.env.PIXORGA_URL,

    sentry: {
      enabled: isFeatureEnabled(process.env.SENTRY_ENABLED),
      dsn: process.env.SENTRY_DSN,
      environment: (process.env.SENTRY_ENVIRONMENT || 'development'),
      maxBreadcrumbs: _getNumber(process.env.SENTRY_MAX_BREADCRUMBS, 100),
      debug: isFeatureEnabled(process.env.SENTRY_DEBUG),
    },
  };

  if (process.env.NODE_ENV === 'test') {
    config.port = 0;

    config.app.domain = 'localhost';

    config.airtable.apiKey = 'test-api-key';
    config.airtable.base = 'test-base';

    config.mailing.enabled = false;
    config.mailing.provider = 'mailjet';
    config.mailing.mailjet.apiKey = 'test-api-key';
    config.mailing.mailjet.apiSecret = 'test-api-secret';
    config.mailing.mailjet.templates.accountCreationTemplateId = 'test-account-creation-template-id';
    config.mailing.mailjet.templates.organizationInvitationTemplateId = 'test-organization-invitation-demand-template-id';
    config.mailing.mailjet.templates.passwordResetTemplateId = 'test-password-reset-template-id';

    config.mailing.sendinblue.apiKey = 'test-api-key';
    config.mailing.sendinblue.templates.accountCreationTemplateId = 'test-account-creation-template-id';
    config.mailing.sendinblue.templates.organizationInvitationTemplateId = 'test-organization-invitation-demand-template-id';
    config.mailing.sendinblue.templates.passwordResetTemplateId = 'test-password-reset-template-id';

    config.captcha.enabled = false;
    config.captcha.googleRecaptchaSecret = 'test-recaptcha-key';

    config.authentication.secret = 'test-jwt-key';
    config.authentication.tokenLifespan = '1d';

    config.temporaryKey.secret = 'test-jwt-key';

    config.logging.enabled = false;

    config.caching.redisUrl = null;
    config.caching.redisCacheKeyLockTTL = 0;
    config.caching.redisCacheLockedWaitBeforeRetry = 0;

    config.pixOrgaUrl = 'http://dev.pix-orga.fr';

    config.sentry.enabled = false;
  }

  return config;

})();
