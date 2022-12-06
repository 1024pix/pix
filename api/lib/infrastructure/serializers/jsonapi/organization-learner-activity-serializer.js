const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(organizationLearnerParticipation) {
    return new Serializer('organization-learner-activity', {
      id: 'organizationLearnerId',
      attributes: ['participations'],
      participations: {
        ref: 'id',
        includes: true,
        attributes: ['campaignType', 'campaignName', 'createdAt', 'sharedAt', 'status'],
      },
    }).serialize(organizationLearnerParticipation);
  },
};
