import { Serializer } from 'jsonapi-serializer';

const serialize = function (enrolledCandidates) {
  return new Serializer('certification-candidate', {
    transform: function (enrolledCandidate) {
      const complementarySubscriptionInfo = enrolledCandidate.findComplementarySubscriptionInfo();
      const complementaryCertification = complementarySubscriptionInfo
        ? {
            id: complementarySubscriptionInfo.complementaryCertificationId,
            label: complementarySubscriptionInfo.complementaryCertificationLabel,
            key: complementarySubscriptionInfo.complementaryCertificationKey,
          }
        : null;

      return {
        ...enrolledCandidate,
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
      'hasSeenCertificationInstructions',
    ],
  }).serialize(enrolledCandidates);
};

export { serialize };
