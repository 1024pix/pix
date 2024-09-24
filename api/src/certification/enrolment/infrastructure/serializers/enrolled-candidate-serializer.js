import { Serializer } from 'jsonapi-serializer';

import { EditedCandidate } from '../../domain/models/EditedCandidate.js';

const deserialize = function ({ candidateId, candidateData }) {
  return new EditedCandidate({
    id: candidateId,
    accessibilityAdjustmentNeeded: candidateData['accessibility-adjustment-needed'],
  });
};

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
      'subscriptions',
      'billingMode',
      'prepaymentCode',
      'hasSeenCertificationInstructions',
      'accessibilityAdjustmentNeeded',
    ],
    subscriptions: {
      include: true,
      ref: 'id',
      attributes: ['complementaryCertificationId', 'type'],
    },
  }).serialize(enrolledCandidates);
};

export { deserialize, serialize };
