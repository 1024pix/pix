const securityController = require('../interfaces/controllers/security-controller');

module.exports = {

  scheme() {
    return { authenticate: (request, h) => securityController.checkUserIsAuthenticated(request, h) };
  }

};
