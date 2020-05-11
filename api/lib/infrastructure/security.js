const securityController = require('../application/security-controller');

module.exports = {

  scheme() {
    return { authenticate: (request, h) => securityController.checkUserIsAuthenticated(request, h) };
  }

};
