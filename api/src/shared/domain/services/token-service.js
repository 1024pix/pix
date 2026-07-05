import Joi from 'joi';
import jsonwebtoken from 'jsonwebtoken';

import { config } from '../../../../src/shared/config.js';

/**
 * Encodes and signs a payload into a JWT token with a time-limited validity
 *
 * @param {Record<string, any>} payload
 * @param {string} secret the secret to use for signing
 * @param {number|string} expiresIn expressed in seconds or a string describing a time span, 60, ex. "2 days", "10h", "7d"
 * @returns an encoded and signed token containing the given payload
 */
function encodeToken(payload, secret, expiresIn) {
  Joi.assert(expiresIn, Joi.required());

  return jsonwebtoken.sign(payload, secret, { expiresIn });
}

/**
 * Decodes a JWT token with the given secret
 *
 * @param {string} token the JWT token
 * @param {string} secret the secret to use to verify the signature
 * @returns the contained payload, otherwise false when the signature is not valid or the token is expired
 */
function getDecodedToken(token, secret = config.authentication.secret) {
  try {
    return jsonwebtoken.verify(token, secret);
  } catch {
    return false;
  }
}

function extractTokenFromAuthorizationHeader(authorizationHeader) {
  if (!authorizationHeader) {
    return authorizationHeader;
  }
  const bearerIndex = authorizationHeader.indexOf('Bearer ');
  if (bearerIndex < 0) {
    return false;
  }
  return authorizationHeader.replace(/Bearer /g, '');
}

function extractUserId(token) {
  const decoded = getDecodedToken(token);
  return decoded.user_id || null;
}

export const tokenService = {
  getDecodedToken,
  encodeToken,
  extractTokenFromAuthorizationHeader,
  extractUserId,
};
