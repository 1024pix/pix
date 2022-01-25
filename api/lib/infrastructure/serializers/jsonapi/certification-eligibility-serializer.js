const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(certificationEligibility) {
    return new Serializer('isCertifiables', {
      transform(certificationEligibility) {
        const clone = Object.assign({}, certificationEligibility);
        clone.isCertifiable = clone.pixCertificationEligible;
        return clone;
      },
      attributes: [
        'isCertifiable',
        'cleaCertificationEligible',
        'pixPlusDroitMaitreCertificationEligible',
        'pixPlusDroitExpertCertificationEligible',
        'pixPlusEduInitieCertificationEligible',
        'pixPlusEduConfirmeCertificationEligible',
        'pixPlusEduAvanceCertificationEligible',
        'pixPlusEduExpertCertificationEligible',
      ],
    }).serialize(certificationEligibility);
  },
};
