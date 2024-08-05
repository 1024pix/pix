import { Serializer } from 'jsonapi-serializer';

const serialize = function (enrolledCandidates) {
  return new Serializer('certification-candidate', {
    transform: function (enrolledCandidate) {
      const candidateSubscription = enrolledCandidate.findComplementarySubscriptionInfo();
      const complementaryCertification = candidateSubscription
        ? { id: candidateSubscription.complementaryCertificationId }
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
