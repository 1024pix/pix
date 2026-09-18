import { LtiPlatformRegistration } from '../../../../../src/identity-access-management/domain/models/LtiPlatformRegistration.js';
import { cryptoService } from '../../../../../src/shared/domain/services/crypto-service.js';

const defaultKeyPair = await cryptoService.generateJSONWebKeyPair();
defaultKeyPair.encryptedPrivateKey = await cryptoService.encrypt(JSON.stringify(defaultKeyPair.privateKey));

function getDefaultToolConfig({ clientId, deploymentId }) {
  return {
    client_id: clientId,
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
      deployment_id: deploymentId,
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
  };
}

export function buildLtiPlatformRegistration({
  clientId = 'AbCD1234',
  deploymentId = '123',
  encryptedPrivateKey = defaultKeyPair.encryptedPrivateKey,
  platformOrigin = 'https://moodle.example.net',
  platformOpenIdConfigUrl = `${platformOrigin}/mod/lti/openid-configuration.php`,
  publicKey = defaultKeyPair.publicKey,
  status = 'active',
  toolConfig = getDefaultToolConfig({ clientId, deploymentId }),
} = {}) {
  return new LtiPlatformRegistration({
    clientId,
    encryptedPrivateKey,
    platformOpenIdConfigUrl,
    platformOrigin,
    publicKey,
    status,
    toolConfig,
  });
}

function getDefaultPlatformOpenIdConfig(origin) {
  return {
    issuer: origin,
    token_endpoint: `${origin}/mod/lti/token.php`,
    token_endpoint_auth_methods_supported: ['private_key_jwt'],
    token_endpoint_auth_signing_alg_values_supported: ['RS256'],
    jwks_uri: `${origin}/mod/lti/certs.php`,
    authorization_endpoint: `${origin}/mod/lti/auth.php`,
    registration_endpoint: `${origin}/mod/lti/openid-registration.php`,
    scopes_supported: [
      'https://purl.imsglobal.org/spec/lti-bo/scope/basicoutcome',
      'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly',
      'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
      'https://purl.imsglobal.org/spec/lti-ags/scope/score',
      'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
      'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly',
      'https://purl.imsglobal.org/spec/lti-ts/scope/toolsetting',
      'openid',
    ],
    response_types_supported: ['id_token'],
    subject_types_supported: ['public', 'pairwise'],
    id_token_signing_alg_values_supported: ['RS256'],
    claims_supported: ['sub', 'iss', 'name', 'given_name', 'family_name', 'email'],
    'https://purl.imsglobal.org/spec/lti-platform-configuration': {
      product_family_code: 'moodle',
      version: '4.5.2 (Build: 20250210)',
      messages_supported: [
        {
          type: 'LtiResourceLinkRequest',
        },
        {
          type: 'LtiDeepLinkingRequest',
          placements: ['ContentArea'],
        },
      ],
      variables: [
        'basic-lti-launch-request',
        'ContentItemSelectionRequest',
        'ToolProxyRegistrationRequest',
        'Context.id',
        'Context.title',
        'Context.label',
        'Context.id.history',
        'Context.sourcedId',
        'Context.longDescription',
        'Context.timeFrame.begin',
        'CourseSection.title',
        'CourseSection.label',
        'CourseSection.sourcedId',
        'CourseSection.longDescription',
        'CourseSection.timeFrame.begin',
        'CourseSection.timeFrame.end',
        'ResourceLink.id',
        'ResourceLink.title',
        'ResourceLink.description',
        'User.id',
        'User.username',
        'Person.name.full',
        'Person.name.given',
        'Person.name.family',
        'Person.email.primary',
        'Person.sourcedId',
        'Person.name.middle',
        'Person.address.street1',
        'Person.address.locality',
        'Person.address.country',
        'Person.address.timezone',
        'Person.phone.primary',
        'Person.phone.mobile',
        'Person.webaddress',
        'Membership.role',
        'Result.sourcedId',
        'Result.autocreate',
        'BasicOutcome.sourcedId',
        'BasicOutcome.url',
        'Moodle.Person.userGroupIds',
      ],
    },
  };
}

export function buildLtiPlatformRegistrationWithPlatformConfig({
  clientId = 'AbCD1234',
  deploymentId = '123',
  encryptedPrivateKey = defaultKeyPair.encryptedPrivateKey,
  platformOrigin = 'https://moodle.example.net',
  platformOpenIdConfigUrl = `${platformOrigin}/mod/lti/openid-configuration.php`,
  publicKey = defaultKeyPair.publicKey,
  status = 'active',
  toolConfig = getDefaultToolConfig({ clientId, deploymentId }),
} = {}) {
  const ltiPlatformRegistration = new LtiPlatformRegistration({
    clientId,
    encryptedPrivateKey,
    platformOpenIdConfigUrl,
    platformOrigin,
    publicKey,
    status,
    toolConfig,
  });
  ltiPlatformRegistration.platformOpenIdConfig = getDefaultPlatformOpenIdConfig(platformOrigin);
  return ltiPlatformRegistration;
}
