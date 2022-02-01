const config = require('../../config');
const { NotFoundError } = require('../../application/http-errors');

module.exports = {
  async checkIfEmailValidationIsEnabled() {
    if (!config.featureToggles.isEmailValidationEnabled) {
      throw new NotFoundError('Cette route est désactivée');
    }
    return true;
  },
};
