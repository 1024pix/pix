const jsonwebtoken = require('jsonwebtoken');
const settings = require('../../../lib/settings');
const {InvalidTokenError} = require('../../../lib/domain/errors');

function _extractTokenFromAuthChain(authChain) {
  const bearerIndex = authChain.indexOf('Bearer ');
  if(bearerIndex < 0) {
    return false;
  }
  return authChain.replace(/Bearer /g, '');
}

module.exports = {
  verify(authChain) {
    const token = (authChain) ? _extractTokenFromAuthChain(authChain) : '';
    return new Promise((resolve, reject) => {
      if(!token) {
        return reject(new InvalidTokenError());
      }

      jsonwebtoken.verify(token, settings.authentication.secret, (err, decoded) => {
        if(err) {
          return reject(new InvalidTokenError());
        }
        const id = decoded.user_id;
        resolve(id);
      });
    });
  }
};
