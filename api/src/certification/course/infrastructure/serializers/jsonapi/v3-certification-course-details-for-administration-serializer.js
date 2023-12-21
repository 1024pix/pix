import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function ({ certificationDetails }) {
  const attributes = ['certificationCourseId', 'certificationChallengesForAdministration'];

  return new Serializer('v3-certification-course-details-for-administration', {
    id: 'certificationCourseId',
    transform: (record) => {
      return {
        ...record,
        certificationChallengesForAdministration: record.certificationChallengesForAdministration.map(
          (certificationChallenge) => ({
            ...certificationChallenge,
            answerStatus: certificationChallenge.answerStatus.status,
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
      transform: (record, columnName) => {
        if (columnName === 'answer-status') {
          return record.answerStatus.status;
        }
      },
      ref: 'challengeId',
      attributes: ['answerStatus', 'validatedLiveAlert', 'answeredAt'],
    },
  }).serialize(certificationDetails);
};

export { serialize };
