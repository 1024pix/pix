import { Serializer } from 'jsonapi-serializer';

const serialize = function (certificationCandidates) {
  return new Serializer('certification-candidate', {
    transform: function (certificationCandidate) {
      const complementaryCertification = certificationCandidate.complementaryCertificationId
        ? {
            id: certificationCandidate.complementaryCertificationId,
            label: certificationCandidate.complementaryCertificationLabel,
            key: certificationCandidate.complementaryCertificationKey,
          }
        : null;

      return {
        ...certificationCandidate,
        complementaryCertification,
      };
    },
    attributes: [
      'firstName',
      'lastName',
      'birthdate',
      'birthProvinceCode',
      'birthCity',
      'birthCountry',
      'email',
      'resultRecipientEmail',
      'externalId',
      'extraTimePercentage',
      'isLinked',
      'organizationLearnerId',
      'sex',
      'birthINSEECode',
      'birthPostalCode',
      'complementaryCertification',
      'billingMode',
      'prepaymentCode',
    ],
  }).serialize(certificationCandidates);
};

export { serialize };
