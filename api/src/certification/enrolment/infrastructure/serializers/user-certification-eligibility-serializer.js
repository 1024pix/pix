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
      if (userCertificationEligibility.doubleCertificationEligibility) {
        return {
          id: userCertificationEligibility.id,
          isCertifiable: userCertificationEligibility.isCertifiable,
          doubleCertificationEligibility: {
            label: userCertificationEligibility.doubleCertificationEligibility.label,
            imageUrl: userCertificationEligibility.doubleCertificationEligibility.imageUrl,
            isBadgeValid: userCertificationEligibility.doubleCertificationEligibility.isBadgeValid,
            validatedDoubleCertification:
              userCertificationEligibility.doubleCertificationEligibility.validatedDoubleCertification,
          },
        };
      }
      return {
        id: userCertificationEligibility.id,
        isCertifiable: userCertificationEligibility.isCertifiable,
      };
    },
    attributes: ['isCertifiable', 'doubleCertificationEligibility'],
  }).serialize(userCertificationEligibility);
};

export const userCertificationEligibilitySerializer = { serialize };
