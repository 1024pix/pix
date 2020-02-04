import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  include: ['assessment', 'campaign'],
  links(campaignParticipation) {
    return {
      'campaignParticipationResult': {
        related: `/api/campaign-participations/${campaignParticipation.id}/campaign-participation-result`
      },
    };
  }
});
