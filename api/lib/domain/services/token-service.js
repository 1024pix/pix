const jsonwebtoken = require('jsonwebtoken');
const { InvalidTemporaryKeyError } = require('../../domain/errors');
const settings = require('../../config');

function createAccessTokenFromUser(user, source) {
  return jsonwebtoken.sign({
    user_id: user.id,
    source
  }, settings.authentication.secret, { expiresIn: settings.authentication.tokenLifespan });
}

function createTokenForCampaignResults(userId) {
  return jsonwebtoken.sign({
    access_id: userId,
  }, settings.authentication.secret, { expiresIn: settings.authentication.tokenForCampaignResultLifespan });
}

function createIdTokenForUserReconciliation(externalUser) {
  return jsonwebtoken.sign({
    first_name: externalUser.firstName,
    last_name: externalUser.lastName,
    saml_id: externalUser.samlId
  }, settings.authentication.secret, { expiresIn: settings.authentication.tokenForStudentReconciliationLifespan });
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
    return (!decoded) ? reject(new InvalidTemporaryKeyError()) : resolve(decoded);
  });
}

function getDecodedToken(token) {
  try {
    return jsonwebtoken.verify(token, settings.authentication.secret);
  }
  catch (err) {
    return false;
  }
}

function extractUserId(token) {
  const decoded = getDecodedToken(token);
  return decoded.user_id || null;
}

function extractUserIdForCampaignResults(token) {
  const decoded = getDecodedToken(token);
  return decoded.access_id || null;
}

async function extractExternalUserFromIdToken(token) {
  const externalUser = await decodeIfValid(token);
  return {
    firstName: externalUser['first_name'],
    lastName: externalUser['last_name'],
    samlId: externalUser['saml_id'],
  };
}

module.exports = {
  createAccessTokenFromUser,
  createTokenForCampaignResults,
  createIdTokenForUserReconciliation,
  extractExternalUserFromIdToken,
  extractUserIdForCampaignResults,
  extractUserId,
  extractTokenFromAuthChain,
  decodeIfValid,
};
