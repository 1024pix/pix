const config = require('../../config');
const { NotFoundError } = require('../../application/http-errors');

module.exports = {
  async isScoAccountRecoveryEnabled() {
    if (!config.featureToggles.isScoAccountRecoveryEnabled) {
      throw new NotFoundError('Cette route est désactivée');
    }
    return true;
  },
};

