const CertificationPartnerAcquisitionBookshelf = require('../data/certification-partner-acquisition');

module.exports = {

  async save(certificationPartnerAcquisition, domainTransaction = {}) {
    return await new CertificationPartnerAcquisitionBookshelf(certificationPartnerAcquisition).save(null , { transacting: domainTransaction.knexTransaction });
  },
};
