import querystring from 'node:querystring';

import { ApplicationAccessToken } from '../../../src/identity-access-management/domain/models/ApplicationAccessToken.js';
import { UserAccessToken } from '../../../src/identity-access-management/domain/models/UserAccessToken.js';

/**
 * Converts a FormData instance to a payload object and content type  for use in HAPI HTTP requests.
 *
 * @param {FormData} formData
 * @returns {{ payload: Buffer; contentType: string }} payload and content-type header
 */
export async function convertFormDataToPayload(formData) {
  const response = new Response(formData);
  return {
    payload: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get('content-type'),
  };
}

/**
 * For acceptance tests. To be used as `const options = generateInjectOptions; await server.inject(options);`
 *
 * @param {Object} params
 * @param {string} params.url
 * @param {string} params.method
 * @param {Object} [params.payload]
 * @param {string} [params.locale]
 * @param {string} [params.audience]
 * @param {Object} [params.authorizationData] - data to generate an AccessToken, for example: { userId: 1234 }
 * @param {boolean} [params.urlEncodePayload]
 * @returns {Object} options
 */
export function generateInjectOptions({ url, method, payload, locale, audience, authorizationData, urlEncodePayload }) {
  const options = {
    url,
    method,
    headers: {
      // cf. cookies = req.headers.cookie in @hapi/hapi/lib/route.js +369
      ...(locale && { cookie: `locale=${locale}` }),
      ...(audience && _generateForwardedHeaders(audience)),
    },
  };

  if (payload) {
    if (urlEncodePayload) {
      options.payload = querystring.stringify(payload);
      options.headers['content-type'] = 'application/x-www-form-urlencoded';
    } else {
      options.payload = payload;
    }
  }

  if (authorizationData) {
    if (!audience) {
      throw new Error('You must provide an audience parameter when providing authorizationData.');
    }

    const accessToken = UserAccessToken.generateUserToken({ ...authorizationData, audience }).accessToken;
    options.headers.authorization = `Bearer ${accessToken}`;
  }

  return options;
}

/**
 * @param {Object} params
 * @param {number} params.userId
 * @param {string} params.source
 * @param {string} params.audience - an origin URL, for example: https://app.pix.org
 * @returns {Object} headers
 */
export function generateAuthenticatedUserRequestHeaders({
  userId = 1234,
  source = 'pix',
  audience = 'https://app.pix.org',
} = {}) {
  const accessToken = UserAccessToken.generateUserToken({ userId, source, audience }).accessToken;

  return {
    ..._generateForwardedHeaders(audience),
    authorization: `Bearer ${accessToken}`,
  };
}

function _generateForwardedHeaders(audience) {
  const url = new URL(audience);
  const protoHeader = url.protocol.slice(0, -1);
  const hostHeader = url.hostname;

  return { 'x-forwarded-proto': protoHeader, 'x-forwarded-host': hostHeader };
}

/**
 * Generate Authorization header for Client Application (MADDO)
 * @param {string} clientId
 * @param {string} source
 * @param {string} scope
 * @returns {string} authorization header
 */
export function generateValidRequestAuthorizationHeaderForApplication(clientId = 'client-id-name', source, scope = '') {
  const accessToken = ApplicationAccessToken.generate({ clientId, source, scope });
  return `Bearer ${accessToken}`;
}
