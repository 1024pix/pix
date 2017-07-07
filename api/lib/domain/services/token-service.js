const jsonwebtoken = require('jsonwebtoken');

const settings = require('../../settings');

function createTokenFromUser(user) {
  return jsonwebtoken.sign({
    user_id: user.get('id'),
    email: user.get('email')
  }, settings.authentication.secret, {expiresIn: settings.authentication.tokenLifespan});
}

function extractTokenFromAuthChain(authChain) {
  const bearerIndex = authChain.indexOf('Bearer ');
  if(bearerIndex < 0) {
    return false;
  }
  return authChain.replace(/Bearer /g, '');
}

function extractUserId(token) {
  let user_id;

  try {
    user_id = jsonwebtoken.verify(token, settings.authentication.secret).user_id;
  } catch (e) {
    user_id = null;
  }

  return user_id;
}

module.exports = {
  createTokenFromUser,
  extractUserId,
  extractTokenFromAuthChain
};
