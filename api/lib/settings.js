const path = require('path');
const packageJson = require('../package.json');

function parseJSONEnv(varName) {
  if (process.env[varName]) {
    return JSON.parse(process.env[varName]);
  }
  return undefined;
}

module.exports = (function() {

  const environment = process.env.NODE_ENV || 'development';
  const version = packageJson.version;

  const config = {
    rootPath: path.normalize(__dirname + '/..'),

    port: parseInt(process.env.PORT, 10) || 3000,

    environment,
    version,

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
      enabled: (process.env.LOG_ENABLED == 'true' || process.env.NODE_ENV != 'test'),
      colorEnabled: ('development' === process.env.NODE_ENV),
      logLevel: (process.env.LOG_LEVEL || 'info'),
    },

    mailjet: {
      apiKey: process.env.MAILJET_KEY,
      apiSecret: process.env.MAILJET_SECRET
    },

    googleReCaptcha: {
      secret: process.env.RECAPTCHA_KEY
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

    // https://github.com/hydra-newmedia/hapi-sentry#options
    sentry: {
      client: {
        dsn: process.env.SENTRY_DSN || false,
        release: version,
        environment,
      },
    },

  };

  if (process.env.NODE_ENV === 'test') {
    config.port = null;

    config.app.domain = 'localhost',

    config.airtable = {
      apiKey: 'test-api-key',
      base: 'test-base',
    };

    config.mailjet = {
      apiKey: 'test-api-ket',
      apiSecret: 'test-api-secret'
    };

    config.googleReCaptcha = {
      secret: 'test-recaptcha-key'
    };

    config.authentication = {
      secret: 'test-jwt-key',
    };

    config.temporaryKey = {
      secret: 'test-jwt-key'
    };

    config.redisUrl = null;
    config.redisCacheKeyLockTTL = 0;
    config.redisCacheLockedWaitBeforeRetry = 0;

    config.sentry.client.dsn = false;
  }

  return config;

})();
