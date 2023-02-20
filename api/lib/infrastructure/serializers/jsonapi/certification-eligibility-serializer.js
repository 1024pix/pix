import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(certificationEligibility) {
    return new Serializer('isCertifiables', {
      transform(certificationEligibility) {
        const clone = Object.assign({}, certificationEligibility);
        clone.isCertifiable = clone.pixCertificationEligible;
        return clone;
      },
      attributes: ['isCertifiable', 'eligibleComplementaryCertifications'],
    }).serialize(certificationEligibility);
  },
};
