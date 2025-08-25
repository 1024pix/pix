import jsonwebtoken from 'jsonwebtoken';

import { config } from '../../../../src/shared/config.js';
import {
  InvalidResultRecipientTokenError,
  InvalidSessionResultTokenError,
  InvalidTemporaryKeyError,
} from '../errors.js';

const CERTIFICATION_RESULTS_BY_RECIPIENT_EMAIL_LINK_SCOPE = 'certificationResultsByRecipientEmailLink';

/**
 * Encode and sign a payload into a JWT token (using jsonwebtoken library)
 * @param {Record<string, any>} payload Token payload
 * @param {string} secret Secret for the signature
 * @param {Record<string, any>} options Sign options (ex: { expiresIn })
 * @returns The encoded and signed token
 */
function encodeToken(payload, secret, options) {
  return jsonwebtoken.sign(payload, secret, options);
}

function createCertificationResultsByRecipientEmailLinkToken({
  sessionId,
  resultRecipientEmail,
  daysBeforeExpiration,
}) {
  return jsonwebtoken.sign(
    {
      session_id: sessionId,
      result_recipient_email: resultRecipientEmail,
      scope: CERTIFICATION_RESULTS_BY_RECIPIENT_EMAIL_LINK_SCOPE,
    },
    config.authentication.secret,
    {
      expiresIn: `${daysBeforeExpiration}d`,
    },
  );
}

function createCertificationResultsLinkToken({ sessionId }) {
  return jsonwebtoken.sign(
    {
      session_id: sessionId,
      scope: config.jwtConfig.certificationResults.scope,
    },
    config.authentication.secret,
    {
      expiresIn: `${config.jwtConfig.certificationResults.tokenLifespan}`,
    },
  );
}

function extractTokenFromAuthChain(authChain) {
  if (!authChain) {
    return authChain;
  }
  const bearerIndex = authChain.indexOf('Bearer ');
  if (bearerIndex < 0) {
    return false;
  }
  return authChain.replace(/Bearer /g, '');
}

function decodeIfValid(token) {
  return new Promise((resolve, reject) => {
    const decoded = getDecodedToken(token);
    return !decoded ? reject(new InvalidTemporaryKeyError()) : resolve(decoded);
  });
}

function getDecodedToken(token, secret = config.authentication.secret) {
  try {
    return jsonwebtoken.verify(token, secret);
  } catch {
    return false;
  }
}

function extractCertificationResultsByRecipientEmailLink(token) {
  const decoded = getDecodedToken(token);
  if (!decoded.session_id || !decoded.result_recipient_email) {
    throw new InvalidResultRecipientTokenError();
  }

  if (decoded.scope !== CERTIFICATION_RESULTS_BY_RECIPIENT_EMAIL_LINK_SCOPE) {
    throw new InvalidResultRecipientTokenError();
  }

  return {
    resultRecipientEmail: decoded.result_recipient_email,
    sessionId: decoded.session_id,
  };
}

function extractCertificationResultsLink(token) {
  const decoded = getDecodedToken(token);
  if (!decoded.session_id) {
    throw new InvalidSessionResultTokenError();
  }

  if (decoded.scope !== config.jwtConfig.certificationResults.scope) {
    throw new InvalidSessionResultTokenError();
  }

  return {
    sessionId: decoded.session_id,
  };
}

function extractUserId(token) {
  const decoded = getDecodedToken(token);
  return decoded.user_id || null;
}

const tokenService = {
  createCertificationResultsByRecipientEmailLinkToken,
  createCertificationResultsLinkToken,
  decodeIfValid,
  getDecodedToken,
  encodeToken,
  extractCertificationResultsByRecipientEmailLink,
  extractCertificationResultsLink,
  extractTokenFromAuthChain,
  extractUserId,
};

/**
 * @typedef TokenService
 */

export {
  createCertificationResultsByRecipientEmailLinkToken,
  createCertificationResultsLinkToken,
  decodeIfValid,
  extractCertificationResultsByRecipientEmailLink,
  extractCertificationResultsLink,
  extractTokenFromAuthChain,
  extractUserId,
  getDecodedToken,
  tokenService,
};
