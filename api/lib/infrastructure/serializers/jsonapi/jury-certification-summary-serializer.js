const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(juryCertificationSummary) {
    return new Serializer('jury-certification-summary', {
      attributes: [
        'firstName',
        'lastName',
        'status',
        'pixScore',
        'createdAt',
        'completedAt',
        'isPublished',
        'examinerComment',
        'hasSeenEndTestScreen',
      ],
    }).serialize(juryCertificationSummary);
  },
};
