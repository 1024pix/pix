const config = require('../../config');
const { NotFoundError } = require('../../application/http-errors');

module.exports = {
  async isCertifPrescriptionSCOEnabled() {
    if (!config.featureToggles.certifPrescriptionSco) {
      throw new NotFoundError('cette route est désactivée');
    }
    return true;
  },

  async isMyAccountEnabled() {
    if (!config.featureToggles.myAccount) {
      throw new NotFoundError('cette route est désactivée');
    }
    return true;
  },
};
