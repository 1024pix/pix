import jsonwebtoken from 'jsonwebtoken';

import { config } from '../../../../lib/config.js';
import {
  ForbiddenAccess,
  InvalidExternalUserTokenError,
  InvalidResultRecipientTokenError,
  InvalidSessionResultError,
  InvalidTemporaryKeyError,
} from '../errors.js';

function _createAccessToken({ userId, source, expirationDelaySeconds }) {
  return jsonwebtoken.sign({ user_id: userId, source }, config.authentication.secret, {
    expiresIn: expirationDelaySeconds,
  });
}

function createAccessTokenFromUser(userId, source) {
  const expirationDelaySeconds = config.authentication.accessTokenLifespanMs / 1000;
  const accessToken = _createAccessToken({ userId, source, expirationDelaySeconds });
  return { accessToken, expirationDelaySeconds };
}

function createAccessTokenFromAnonymousUser(userId) {
  const expirationDelaySeconds = config.anonymous.accessTokenLifespanMs / 1000;
  return _createAccessToken({ userId, source: 'pix', expirationDelaySeconds });
}

function createAccessTokenForSaml(userId) {
  const expirationDelaySeconds = config.saml.accessTokenLifespanMs / 1000;
  return _createAccessToken({ userId, source: 'external', expirationDelaySeconds });
}

function createAccessTokenFromApplication(
  clientId,
  source,
  scope,
  secret = config.authentication.secret,
  expiresIn = config.authentication.accessTokenLifespanMs,
) {
  return jsonwebtoken.sign(
    {
      client_id: clientId,
      source,
      scope,
    },
    secret,
    { expiresIn },
  );
}

function createTokenForCampaignResults({ userId, campaignId }) {
  return jsonwebtoken.sign(
    {
      access_id: userId,
      campaign_id: campaignId,
    },
    config.authentication.secret,
    { expiresIn: config.authentication.tokenForCampaignResultLifespan },
  );
}

function createIdTokenForUserReconciliation(externalUser) {
  return jsonwebtoken.sign(
    {
      first_name: externalUser.firstName,
      last_name: externalUser.lastName,
      saml_id: externalUser.samlId,
    },
    config.authentication.secret,
    { expiresIn: config.authentication.tokenForStudentReconciliationLifespan },
  );
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
    },
    config.authentication.secret,
    {
      expiresIn: `${daysBeforeExpiration}d`,
    },
  );
}

function createCertificationResultsLinkToken({ sessionId, daysBeforeExpiration }) {
  return jsonwebtoken.sign(
    {
      session_id: sessionId,
    },
    config.authentication.secret,
    {
      expiresIn: `${daysBeforeExpiration}d`,
    },
  );
}

function createPasswordResetToken(userId) {
  return jsonwebtoken.sign(
    {
      user_id: userId,
    },
    config.authentication.secret,
    { expiresIn: config.authentication.passwordResetTokenLifespan },
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
  } catch (err) {
    return false;
  }
}

function extractSamlId(token) {
  const decoded = getDecodedToken(token);
  return decoded.saml_id || null;
}

function extractResultRecipientEmailAndSessionId(token) {
  const decoded = getDecodedToken(token);
  if (!decoded.session_id || !decoded.result_recipient_email) {
    throw new InvalidResultRecipientTokenError();
  }

  return {
    resultRecipientEmail: decoded.result_recipient_email,
    sessionId: decoded.session_id,
  };
}

function extractSessionId(token) {
  const decoded = getDecodedToken(token);
  if (!decoded.session_id) {
    throw new InvalidSessionResultError();
  }

  return {
    sessionId: decoded.session_id,
  };
}

function extractUserId(token) {
  const decoded = getDecodedToken(token);
  return decoded.user_id || null;
}

function extractClientId(token, secret = config.authentication.secret) {
  const decoded = getDecodedToken(token, secret);
  return decoded.client_id || null;
}

function extractCampaignResultsTokenContent(token) {
  const decoded = getDecodedToken(token);
  if (decoded === false) {
    throw new ForbiddenAccess();
  }
  return { userId: decoded.access_id, campaignId: decoded.campaign_id };
}

async function extractExternalUserFromIdToken(token) {
  const externalUser = await getDecodedToken(token);

  if (!externalUser) {
    throw new InvalidExternalUserTokenError(
      'Une erreur est survenue. Veuillez réessayer de vous connecter depuis le médiacentre.',
    );
  }

  return {
    firstName: externalUser['first_name'],
    lastName: externalUser['last_name'],
    samlId: externalUser['saml_id'],
  };
}
const tokenService = {
  createAccessTokenFromUser,
  createAccessTokenForSaml,
  createAccessTokenFromApplication,
  createAccessTokenFromAnonymousUser,
  createTokenForCampaignResults,
  createIdTokenForUserReconciliation,
  createCertificationResultsByRecipientEmailLinkToken,
  createCertificationResultsLinkToken,
  createPasswordResetToken,
  decodeIfValid,
  getDecodedToken,
  extractExternalUserFromIdToken,
  extractResultRecipientEmailAndSessionId,
  extractSamlId,
  extractSessionId,
  extractTokenFromAuthChain,
  extractUserId,
  extractClientId,
  extractCampaignResultsTokenContent,
};

export {
  tokenService,
  createAccessTokenFromUser,
  createAccessTokenForSaml,
  createAccessTokenFromApplication,
  createAccessTokenFromAnonymousUser,
  createTokenForCampaignResults,
  createIdTokenForUserReconciliation,
  createCertificationResultsByRecipientEmailLinkToken,
  createCertificationResultsLinkToken,
  createPasswordResetToken,
  decodeIfValid,
  getDecodedToken,
  extractExternalUserFromIdToken,
  extractResultRecipientEmailAndSessionId,
  extractSamlId,
  extractSessionId,
  extractTokenFromAuthChain,
  extractUserId,
  extractClientId,
  extractCampaignResultsTokenContent,
};
