import jsonwebtoken from 'jsonwebtoken';

import { cryptoService } from '../../../shared/domain/services/crypto-service.js';

export const deepLinkingService = {
  /**
   * @param {object} args
   * @param {import('../models/LtiPlatformRegistration.js').LtiPlatformRegistration} args.registration
   * @param {object} args.deepLinkingSettings
   * @param {object[]} args.contentItems
   */
  async encodeResponse({ contentItems, registration, deepLinkingSettings }, dependencies = { cryptoService }) {
    const privateKey = {
      format: 'jwk',
      key: JSON.parse(await dependencies.cryptoService.decrypt(registration.encryptedPrivateKey)),
    };

    return jsonwebtoken.sign(
      {
        iss: registration.clientId,
        aud: deepLinkingSettings.deep_link_return_url,
        'https://purl.imsglobal.org/spec/lti/claim/deployment_id': registration.deploymentId,
        'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiDeepLinkingResponse',
        'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
        'https://purl.imsglobal.org/spec/lti-dl/claim/data': deepLinkingSettings.data,
        'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': contentItems,
      },
      privateKey,
      {
        expiresIn: 3600,
        algorithm: 'RS256',
        keyid: registration.publicKey.kid,
      },
    );
  },
};
