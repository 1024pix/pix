const { featureToggles } = require('../../config');
const { NotFoundError } = require('../../application/http-errors');

module.exports = {
  async isCertifPrescriptionSCOEnabled() {
    if (!featureToggles.certifPrescriptionSco) {
      throw new NotFoundError('cette route est désactivée');
    }
    return true;
  },

  async isMyAccountEnabled() {
    if (!featureToggles.myAccount) {
      throw new NotFoundError('cette route est désactivée');
    }
    return true;
  },
};
