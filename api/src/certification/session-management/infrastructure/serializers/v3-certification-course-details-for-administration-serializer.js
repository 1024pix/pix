import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serialize({ certificationDetails }) {
  const attributes = [
    'certificationCourseId',
    'certificationChallengesForAdministration',
    'isRejectedForFraud',
    'createdAt',
    'assessmentState',
    'assessmentResultStatus',
    'abortReason',
    'pixScore',
    'reachedResultKey',
    'numberOfChallenges',
    'certificationFramework',
    'lastAnswerAt',
  ];

  return new Serializer('v3-certification-course-details-for-administration', {
    id: 'certificationCourseId',
    transform: (record) => {
      return {
        ...record,
        reachedResultKey: record.reachedResultKey,
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
}
