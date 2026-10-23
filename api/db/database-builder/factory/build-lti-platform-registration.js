import { cryptoService } from '../../../src/shared/domain/services/crypto-service.js';
import { databaseBuffer } from '../database-buffer.ts';

const defaultKeyPair = await cryptoService.generateJSONWebKeyPair();
defaultKeyPair.encryptedPrivateKey = await cryptoService.encrypt(JSON.stringify(defaultKeyPair.privateKey));

export function buildLtiPlatformRegistration({
  clientId = 'AbCD1234',
  platformId,
  encryptedPrivateKey = defaultKeyPair.encryptedPrivateKey,
  platformOpenIdConfigUrl = 'https://moodle.example.net/mod/lti/openid-configuration.php',
  publicKey = defaultKeyPair.publicKey,
  status = 'active',
  toolConfig = {
    client_id: 'AbCD1234',
    response_types: ['id_token'],
    jwks_uri: 'https://pix.example.net/api/lti/keys',
    initiate_login_uri: 'https://pix.example.net/api/lti/init',
    grant_types: ['client_credentials', 'implicit'],
    redirect_uris: ['https://pix.example.net/api/lti/launch'],
    application_type: 'web',
    token_endpoint_auth_method: 'private_key_jwt',
    client_name: 'Pix',
    logo_uri: '',
    scope:
      'https://purl.imsglobal.org/spec/lti-ags/scope/score https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly https://purl.imsglobal.org/spec/lti-ags/scope/lineitem https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly',
    'https://purl.imsglobal.org/spec/lti-tool-configuration': {
      version: '1.3.0',
      deployment_id: '123',
      target_link_uri: 'https://pix.example.net/api/lti',
      domain: 'pix.example.net',
      description: '',
      messages: [
        {
          type: 'LtiDeepLinkingRequest',
          target_link_uri: 'https://pix.example.net/api/lti/content-selection',
        },
      ],
      claims: ['sub', 'iss', 'name', 'family_name', 'given_name', 'email'],
    },
  },
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'lti_platform_registrations',
    values: {
      clientId,
      platformId,
      encryptedPrivateKey,
      platformOpenIdConfigUrl,
      publicKey,
      status,
      toolConfig,
    },
  });
}
