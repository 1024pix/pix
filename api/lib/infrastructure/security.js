const securityPreHandlers = require('../application/security-pre-handlers');

module.exports = {

  scheme() {
    return { authenticate: (request, h) => securityPreHandlers.checkUserIsAuthenticated(request, h) };
  }

};
