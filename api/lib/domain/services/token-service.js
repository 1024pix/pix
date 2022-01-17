const jsonwebtoken = require('jsonwebtoken');
const {
  InvalidTemporaryKeyError,
  InvalidExternalUserTokenError,
  InvalidResultRecipientTokenError,
  InvalidSessionResultError,
} = require('../../domain/errors');
const settings = require('../../config');

function createAccessTokenFromUser(userId, source) {
  const expirationDelaySeconds = settings.authentication.accessTokenLifespanMs / 1000;
  const accessToken = jsonwebtoken.sign({ user_id: userId, source }, settings.authentication.secret, {
    expiresIn: expirationDelaySeconds,
  });
  return { accessToken, expirationDelaySeconds };
}

function createAccessTokenFromExternalUser(userId) {
  return createAccessTokenFromUser(userId, 'external');
}

function createAccessTokenFromApplication(
  clientId,
  source,
  scope,
  secret = settings.authentication.secret,
  expiresIn = settings.authentication.accessTokenLifespanMs
) {
  return jsonwebtoken.sign(
    {
      client_id: clientId,
      source,
      scope,
    },
    secret,
    { expiresIn }
  );
}

function createTokenForCampaignResults(userId) {
  return jsonwebtoken.sign(
    {
      access_id: userId,
    },
    settings.authentication.secret,
    { expiresIn: settings.authentication.tokenForCampaignResultLifespan }
  );
}

function createIdTokenForUserReconciliation(externalUser) {
  return jsonwebtoken.sign(
    {
      first_name: externalUser.firstName,
      last_name: externalUser.lastName,
      saml_id: externalUser.samlId,
    },
    settings.authentication.secret,
    { expiresIn: settings.authentication.tokenForStudentReconciliationLifespan }
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
    settings.authentication.secret,
    {
      expiresIn: `${daysBeforeExpiration}d`,
    }
  );
}

function createCertificationResultsLinkToken({ sessionId, daysBeforeExpiration }) {
  return jsonwebtoken.sign(
    {
      session_id: sessionId,
    },
    settings.authentication.secret,
    {
      expiresIn: `${daysBeforeExpiration}d`,
    }
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

function getDecodedToken(token, secret = settings.authentication.secret) {
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

function extractClientId(token, secret = settings.authentication.secret) {
  const decoded = getDecodedToken(token, secret);
  return decoded.client_id || null;
}

function extractUserIdForCampaignResults(token) {
  const decoded = getDecodedToken(token);
  return decoded.access_id || null;
}

async function extractExternalUserFromIdToken(token) {
  const externalUser = await getDecodedToken(token);

  if (!externalUser) {
    throw new InvalidExternalUserTokenError(
      'Une erreur est survenue. Veuillez réessayer de vous connecter depuis le médiacentre.'
    );
  }

  return {
    firstName: externalUser['first_name'],
    lastName: externalUser['last_name'],
    samlId: externalUser['saml_id'],
  };
}

async function extractPayloadFromPoleEmploiIdToken(idToken) {
  const { given_name, family_name, nonce, idIdentiteExterne } = await jsonwebtoken.decode(idToken);
  return { given_name, family_name, nonce, idIdentiteExterne };
}

module.exports = {
  createAccessTokenFromUser,
  createAccessTokenFromExternalUser,
  createAccessTokenFromApplication,
  createTokenForCampaignResults,
  createIdTokenForUserReconciliation,
  createCertificationResultsByRecipientEmailLinkToken,
  createCertificationResultsLinkToken,
  decodeIfValid,
  getDecodedToken,
  extractExternalUserFromIdToken,
  extractPayloadFromPoleEmploiIdToken,
  extractResultRecipientEmailAndSessionId,
  extractSamlId,
  extractSessionId,
  extractTokenFromAuthChain,
  extractUserId,
  extractClientId,
  extractUserIdForCampaignResults,
};
