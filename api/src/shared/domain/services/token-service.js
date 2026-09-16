import Joi from 'joi';
import jsonwebtoken from 'jsonwebtoken';

import { config } from '../../../../config/config.js';

export const tokenType = Object.freeze({
  ACCESS_TOKEN: 'at+jwt',
  REFRESH_TOKEN: 'rt+jwt',
});

/**
 * Encodes and signs a payload into a JWT token with a time-limited validity
 *
 * @param {Record<string, any>} payload
 * @param {string} secret the secret to use for signing
 * @param {number|string} expiresIn expressed in seconds or a string describing a time span, 60, ex. "2 days", "10h", "7d"
 * @param {{
 *   type?: tokenType[keyof tokenType]
 * }} options
 * @returns an encoded and signed token containing the given payload
 */
function encodeToken(payload, secret, expiresIn, { type = tokenType.ACCESS_TOKEN } = {}) {
  Joi.assert(expiresIn, Joi.required());
  Joi.assert(
    type,
    Joi.string()
      .valid(...Object.values(tokenType))
      .required(),
  );

  return jsonwebtoken.sign(payload, secret, { expiresIn, header: { typ: type } });
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
