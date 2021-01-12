const securityPreHandlers = require('../application/security-livret-scolaire-pre-handlers');

module.exports = {

  scheme() {
    return { authenticate: (request, h) => securityPreHandlers.checkApplicationIsAuthenticated(request, h) };
  },

};
