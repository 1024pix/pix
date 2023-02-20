import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(certificationDetails) {
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
  },
};
