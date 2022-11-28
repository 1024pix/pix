const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(organizationLearnerParticipation) {
    return new Serializer('organization-learner-activity', {
      attributes: ['participations'],
      participations: {
        ref: 'id',
        includes: true,
        attributes: ['campaignType', 'campaignName', 'createdAt', 'sharedAt', 'status'],
      },
    }).serialize(organizationLearnerParticipation);
  },
};
