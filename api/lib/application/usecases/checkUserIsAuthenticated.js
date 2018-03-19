const tokenService = require('../../domain/services/token-service');

module.exports = {

  execute(accessToken) {
    return tokenService.verifyValidity(accessToken)
      .catch(() => false);
  }

};
