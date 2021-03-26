const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(certificationDetails) {
    return new Serializer('certification-details', {
      attributes: ['userId', 'createdAt', 'completedAt', 'status',
        'totalScore', 'percentageCorrectAnswers', 'competencesWithMark', 'listChallengesAndAnswers'],
    }).serialize(certificationDetails);
  },
};
