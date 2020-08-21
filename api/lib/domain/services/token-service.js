const jsonwebtoken = require('jsonwebtoken');
const { InvalidTemporaryKeyError } = require('../../domain/errors');
const settings = require('../../config');

function createTokenFromUser(user, source) {
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

function createTokenForStudentReconciliation({ userAttributes }) {
  const { attributeMapping } = settings.saml;
  return jsonwebtoken.sign({
    first_name: userAttributes[attributeMapping.firstName],
    last_name: userAttributes[attributeMapping.lastName],
    saml_id: userAttributes[attributeMapping.samlId]
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

function verifyValidity(token) {
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

module.exports = {
  createTokenFromUser,
  createTokenForCampaignResults,
  createTokenForStudentReconciliation,
  extractUserIdForCampaignResults,
  extractUserId,
  extractTokenFromAuthChain,
  verifyValidity,
};
