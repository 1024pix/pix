import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: ['isShared', 'sharedAt', 'createdAt', 'participantExternalId'],
  include: ['campaign'],
  links(campaignParticipation) {
    return {
      assessment: {
        related: `/api/assessments/${campaignParticipation.assessmentId}`,
      },
    };
  },
});
