const jsonwebtoken = require('jsonwebtoken');
const settings = require('../../../lib/settings');
const { InvalidTokenError } = require('../../../lib/domain/errors');

const tokenService = require('../../../lib/domain/services/token-service');

module.exports = {
  verify(authChain) {
    const token = (authChain) ? tokenService.extractTokenFromAuthChain(authChain) : '';
    return new Promise((resolve, reject) => {
      if(!token) {
        return reject(new InvalidTokenError());
      }

      jsonwebtoken.verify(token, settings.authentication.secret, (err, decoded) => {
        if (err) {
          return reject(new InvalidTokenError());
        }
        resolve(decoded.user_id);
      });
    });
  }
};
