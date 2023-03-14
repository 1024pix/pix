import samlify from 'samlify';
samlify.setSchemaValidator({
  validate: () => {
    return true;
  },
});
import { logger } from './logger.js';
import { config } from '../config.js';

const samlSettings = config.saml;

let _serviceProvider, _identityProvider;

function _getServiceProvider() {
  if (!_serviceProvider) {
    try {
      _serviceProvider = samlify.ServiceProvider(samlSettings.spConfig);
      logger.info('Initialized SAML service provider');
    } catch (err) {
      err.message = 'Error initializing SAML service provider: ' + err.message;
      throw err;
    }
  }
  return _serviceProvider;
}

function _getIdentityProvider() {
  if (!_identityProvider) {
    try {
      _identityProvider = samlify.IdentityProvider(samlSettings.idpConfig);
      logger.info('Initialized SAML identity provider');
    } catch (err) {
      err.message = 'Error initializing SAML identity provider: ' + err.message;
      throw err;
    }
  }
  return _identityProvider;
}

const getServiceProviderMetadata = function () {
  return _getServiceProvider().getMetadata();
};

const createLoginRequest = function () {
  const { context } = _getServiceProvider().createLoginRequest(_getIdentityProvider(), 'redirect');
  logger.trace({ SAMLRequest: context }, 'Created SAML request');
  return context;
};

const parsePostResponse = async function (payload) {
  logger.trace({ SAMLPayload: payload }, 'Parsing SAML response');
  const { extract } = await _getServiceProvider().parseLoginResponse(_getIdentityProvider(), 'post', {
    body: payload,
  });
  logger.trace({ parsedSAML: extract }, 'Parsed SAML response');
  return extract.attributes;
};

export { getServiceProviderMetadata, createLoginRequest, parsePostResponse };
