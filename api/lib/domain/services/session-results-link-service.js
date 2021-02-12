const tokenService = require('./token-service');
const settings = require('../../config');

module.exports = {

  generateResultsLink(sessionId) {
    const daysBeforeExpiration = 30;

    const token = tokenService.createCertificationResultsLinkToken({ sessionId, daysBeforeExpiration });
    const link = `${settings.domain.pixApp + settings.domain.tldOrg}/api/sessions/download-all-results/${token}`;

    return link;
  },
};
