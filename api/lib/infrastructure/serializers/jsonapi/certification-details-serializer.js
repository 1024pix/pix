import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (certificationDetails) {
  return new Serializer('certification-details', {
    attributes: [
      'userId',
      'createdAt',
      'completedAt',
      'status',
      'totalScore',
      'percentageCorrectAnswers',
      'competencesWithMark',
      'listChallengesAndAnswers',
    ],
  }).serialize(certificationDetails);
};

export { serialize };
