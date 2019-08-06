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
      mailjetApiKey: process.env.MAILJET_KEY,
      mailjetApiSecret: process.env.MAILJET_SECRET,
      mailjetAccountCreationTemplateId: process.env.MAILJET_ACCOUNT_CREATION_TEMPLATE_ID,
      mailjetPasswordResetTemplateId: process.env.MAILJET_PASSWORD_RESET_TEMPLATE_ID,
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
      dayBeforeImproving: process.env.DAYS_BEFORE_IMPROVING,
      dayBeforeCompetenceResetV2: process.env.DAY_BEFORE_COMPETENCE_RESET_V2
    },
  };

  if (process.env.NODE_ENV === 'test') {
    config.port = 0;

    config.app.domain = 'localhost';

    config.airtable.apiKey = 'test-api-key';
    config.airtable.base = 'test-base';

    config.mailing.enabled = false;
    config.mailing.mailjetApiKey = 'test-api-ket';
    config.mailing.mailjetApiSecret = 'test-api-secret';
    config.mailing.mailjetAccountCreationTemplateId = 'test-account-creation-template-id';
    config.mailing.mailjetPasswordResetTemplateId = 'test-password-reset-template-id';

    config.captcha.enabled = false;
    config.captcha.googleRecaptchaSecret = 'test-recaptcha-key';

    config.authentication.secret = 'test-jwt-key';
    config.authentication.tokenLifespan = '1d';

    config.temporaryKey.secret = 'test-jwt-key';

    config.logging.enabled = false;

    config.caching.redisUrl = null;
    config.caching.redisCacheKeyLockTTL = 0;
    config.caching.redisCacheLockedWaitBeforeRetry = 0;
  }

  return config;

})();
