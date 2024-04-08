/**
 * @typedef {import ('../../../domain/read-models/CertificationEligibility.js').CertificationEligibility} CertificationEligibility
 */
import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

/**
 * @param {CertificationEligibility} certificationEligibility
 */
const serialize = function (certificationEligibility) {
  return new Serializer('isCertifiables', {
    transform(certificationEligibility) {
      const clone = Object.assign({}, certificationEligibility);
      clone.isCertifiable = clone.pixCertificationEligible;
      return clone;
    },
    attributes: ['isCertifiable', 'complementaryCertifications'],
    complementaryCertifications: ['label', 'imageUrl', 'isOutdated', 'isAcquiredExpectedLevel'],
  }).serialize(certificationEligibility);
};

export { serialize };
