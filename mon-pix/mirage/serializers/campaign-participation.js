import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: [
    'isShared',
    'sharedAt',
    'createdAt',
    'participantExternalId',
  ],
  include: [
    'campaign',
    'user',
  ],
  links(campaignParticipation) {
    return {
      'assessment': {
        related: `/api/assessments/${campaignParticipation.assessmentId}`
      },
      'campaignParticipationResult': {
        related: `/api/campaign-participations/${campaignParticipation.id}/campaign-participation-result`
      },
    };
  }
});
