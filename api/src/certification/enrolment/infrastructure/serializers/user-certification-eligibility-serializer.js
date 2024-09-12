/**
 * @typedef {import ('../../domain/read-models/UserCertificationEligibility.js').UserCertificationEligibility} UserCertificationEligibility
 */
import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

/**
 * @param {UserCertificationEligibility} userCertificationEligibility
 */
const serialize = function (userCertificationEligibility) {
  return new Serializer('isCertifiables', {
    transform(userCertificationEligibility) {
      const clone = Object.assign({}, userCertificationEligibility);
      clone.complementaryCertifications = clone.certificationEligibilities;
      return clone;
    },
    attributes: ['isCertifiable', 'complementaryCertifications'],
    complementaryCertifications: ['label', 'imageUrl', 'isOutdated', 'isAcquiredExpectedLevel'],
  }).serialize(userCertificationEligibility);
};

export { serialize };
