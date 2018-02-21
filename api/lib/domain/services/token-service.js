const jsonwebtoken = require('jsonwebtoken');
const { InvalidTemporaryKeyError } = require('../../domain/errors');
const settings = require('../../settings');

function createTokenFromUser(user) {
  return jsonwebtoken.sign({
    user_id: user.get('id'),
  }, settings.authentication.secret, { expiresIn: settings.authentication.tokenLifespan });
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

module.exports = {
  createTokenFromUser,
  extractUserId,
  extractTokenFromAuthChain,
  verifyValidity
};
