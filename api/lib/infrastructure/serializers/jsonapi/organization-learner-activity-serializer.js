const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(organizationLearnerActivity) {
    return new Serializer('organization-learner-activity', {
      transform: (organizationLearnerActivity) => ({
        ...organizationLearnerActivity,
        organizationLearnerParticipations: organizationLearnerActivity.participations,
      }),
      id: 'organizationLearnerId',
      attributes: ['organizationLearnerParticipations'],
      organizationLearnerParticipations: {
        ref: 'id',
        includes: true,
        attributes: ['campaignType', 'campaignName', 'createdAt', 'sharedAt', 'status'],
      },
    }).serialize(organizationLearnerActivity);
  },
};
