const CertificationPartnerAcquisitionBookshelf = require('../data/certification-partner-acquisition');

module.exports = {

  async save(certificationPartnerAcquisition) {
    return await new CertificationPartnerAcquisitionBookshelf(certificationPartnerAcquisition).save();
  },
};
