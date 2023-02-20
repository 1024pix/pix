import samlify from 'samlify';
samlify.setSchemaValidator({
  validate: () => {
    return true;
  },
});
import logger from './logger';
import { saml as samlSettings } from '../config';

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

async function parsePostResponse(payload) {
  logger.trace({ SAMLPayload: payload }, 'Parsing SAML response');
  const { extract } = await _getServiceProvider().parseLoginResponse(_getIdentityProvider(), 'post', { body: payload });
  logger.trace({ parsedSAML: extract }, 'Parsed SAML response');
  return extract.attributes;
}

export default {
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
