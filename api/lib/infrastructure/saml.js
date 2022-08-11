const samlify = require('samlify');
samlify.setSchemaValidator({
  validate: () => {
    return true;
  },
});
const logger = require('./logger');
const samlSettings = require('../config').saml;

let _serviceProvider, _identityProvider;

function _getServiceProvider() {
  if (!_serviceProvider) {
    try {
      _serviceProvider = samlify.ServiceProvider(samlSettings.spConfig);
      logger.info('Initialized SAML service provider');
    } catch (error) {
      error.message = 'Error initializing SAML service provider: ' + error.message;
      throw error;
    }
  }
  return _serviceProvider;
}

function _getIdentityProvider() {
  if (!_identityProvider) {
    try {
      _identityProvider = samlify.IdentityProvider(samlSettings.idpConfig);
      logger.info('Initialized SAML identity provider');
    } catch (error) {
      error.message = 'Error initializing SAML identity provider: ' + error.message;
      throw error;
    }
  }
  return _identityProvider;
}

async function parsePostResponse(payload) {
  logger.trace({ SAMLPayload: payload }, 'Parsing SAML response');
  const { extract } = await _getServiceProvider().parseLoginResponse(_getIdentityProvider(), 'post', { body: payload });
  logger.trace({ parsedSAML: extract }, 'Parsed SAML response');
  return extract.attributes;
}

module.exports = {
  getServiceProviderMetadata() {
    return _getServiceProvider().getMetadata();
  },

  createLoginRequest() {
    const { context } = _getServiceProvider().createLoginRequest(_getIdentityProvider(), 'redirect');
    logger.trace({ SAMLRequest: context }, 'Created SAML request');
    return context;
  },

  parsePostResponse,
};
