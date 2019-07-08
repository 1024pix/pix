const path = require('path');

function parseJSONEnv(varName) {
  if (process.env[varName]) {
    return JSON.parse(process.env[varName]);
  }
  return undefined;
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
      enabled: (process.env.LOG_ENABLED === 'true'),
      colorEnabled: (process.env.NODE_ENV === 'development'),
      logLevel: (process.env.LOG_LEVEL || 'info'),
    },

    mailing: {
      enabled: !!process.env.MAILJET_KEY,
      mailjetApiKey: process.env.MAILJET_KEY,
      mailjetApiSecret: process.env.MAILJET_SECRET
    },

    captcha: {
      enabled: !!process.env.RECAPTCHA_KEY,
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

    passwordValidationPattern: '^(?=.*\\p{L})(?=.*\\d).{8,}$',

    redisUrl: process.env.REDIS_URL,
    redisCacheKeyLockTTL: parseInt(process.env.REDIS_CACHE_KEY_LOCK_TTL, 10) || 60000,
    redisCacheLockedWaitBeforeRetry: parseInt(process.env.REDIS_CACHE_LOCKED_WAIT_BEFORE_RETRY, 10) || 1000,

    system: {
      samplingHeapProfilerEnabled: (process.env.SYSTEM_SAMPLING_HEAP_PROFILER_ENABLED === 'true'),
    },

    features: {
      dayBeforeCompetenceResetV2: process.env.DAY_BEFORE_COMPETENCE_RESET_V2
    },
  };

  if (process.env.NODE_ENV === 'test') {
    config.port = null;

    config.app.domain = 'localhost';

    config.airtable = {
      apiKey: 'test-api-key',
      base: 'test-base',
    };

    config.mailing = {
      enabled: false,
      mailjetApiKey: 'test-api-ket',
      mailjetApiSecret: 'test-api-secret'
    };

    config.captcha = {
      enabled: false,
      googleRecaptchaSecret: 'test-recaptcha-key'
    };

    config.authentication = {
      secret: 'test-jwt-key',
      tokenLifespan: '1d',
      tokenForCampaignResultLifespan: '1h',
    };

    config.temporaryKey = {
      secret: 'test-jwt-key',
      tokenLifespan: '1d',
    };

    config.logging.enabled = false;

    config.redisUrl = null;
    config.redisCacheKeyLockTTL = 0;
    config.redisCacheLockedWaitBeforeRetry = 0;
  }

  return config;

})();
