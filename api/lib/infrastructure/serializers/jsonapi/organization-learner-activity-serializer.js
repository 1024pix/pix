const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(organizationLearnerActivity) {
    return new Serializer('organization-learner-activity', {
      transform: (organizationLearnerActivity) => ({
        ...organizationLearnerActivity,
        organizationLearnerParticipations: organizationLearnerActivity.participations,
        organizationLearnerStatistics: organizationLearnerActivity.statistics,
      }),
      id: 'organizationLearnerId',
      attributes: ['organizationLearnerParticipations', 'organizationLearnerStatistics'],
      organizationLearnerParticipations: {
        ref: 'id',
        includes: true,
        attributes: ['campaignType', 'campaignName', 'createdAt', 'sharedAt', 'status', 'campaignId'],
      },
      organizationLearnerStatistics: {
        ref: 'campaignType',
        includes: true,
        attributes: ['total', 'shared', 'started', 'to_share'],
      },
    }).serialize(organizationLearnerActivity);
  },
};
