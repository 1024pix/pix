import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function ({ certificationDetails }) {
  const attributes = [
    'certificationCourseId',
    'certificationChallengesForAdministration',
    'isRejectedForFraud',
    'isCancelled',
    'createdAt',
    'completedAt',
    'assessmentState',
    'assessmentResultStatus',
    'abortReason',
    'pixScore',
  ];

  return new Serializer('v3-certification-course-details-for-administration', {
    id: 'certificationCourseId',
    transform: (record) => {
      return {
        ...record,
        certificationChallengesForAdministration: record.certificationChallengesForAdministration.map(
          (certificationChallenge) => ({
            ...certificationChallenge,
            answerStatus: certificationChallenge.answerStatus?.status
              ? certificationChallenge.answerStatus.status
              : null,
          }),
        ),
      };
    },
    attributes,
    typeForAttribute: (attribute) => {
      if (attribute === 'certificationChallengesForAdministration')
        return 'certification-challenges-for-administration';
    },
    certificationChallengesForAdministration: {
      ref: 'challengeId',
      attributes: [
        'answerStatus',
        'validatedLiveAlert',
        'answeredAt',
        'answerValue',
        'competenceName',
        'competenceIndex',
        'skillName',
      ],
    },
  }).serialize(certificationDetails);
};

export { serialize };
