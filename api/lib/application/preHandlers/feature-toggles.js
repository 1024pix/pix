const config = require('../../config');
const { NotFoundError } = require('../../application/http-errors');

module.exports = {
  async checkIfSSOAccountReconciliationIsEnabled() {
    if (!config.featureToggles.isSsoAccountReconciliationEnabled) {
      throw new NotFoundError('Cette route est désactivée');
    }
    return true;
  },
};
