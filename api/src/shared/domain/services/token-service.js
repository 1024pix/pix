import Joi from 'joi';
import jsonwebtoken from 'jsonwebtoken';

import { config } from '../../../../src/shared/config.js';
import { InvalidTemporaryKeyError } from '../errors.js';

/**
 * Encodes and signs a payload into a JWT token with a time-limited validity
 *
 * @param {Record<string, any>} payload Token payload
 * @param {string} secret Secret for the signature
 * @param {number} expiresIn expressed in seconds or a string describing a time span, 60, ex. "2 days", "10h", "7d"
 * @returns The encoded and signed token
 */
function encodeToken(payload, secret, expiresIn) {
  Joi.assert(expiresIn, Joi.required());

  return jsonwebtoken.sign(payload, secret, { expiresIn });
}

/**
 * Decode a token with the given secret
 * @param {string} token
 * @param {string} secret Secret for the signature
 * @returns The decoded token, otherwise false when cannot be decoded
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

function decodeIfValid(token) {
  return new Promise((resolve, reject) => {
    const decoded = getDecodedToken(token);
    return !decoded ? reject(new InvalidTemporaryKeyError()) : resolve(decoded);
  });
}

function extractUserId(token) {
  const decoded = getDecodedToken(token);
  return decoded.user_id || null;
}

export const tokenService = {
  decodeIfValid,
  getDecodedToken,
  encodeToken,
  extractTokenFromAuthorizationHeader,
  extractUserId,
};
