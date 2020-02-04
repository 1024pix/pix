import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  include: ['competences', 'organizations'],
  links(user) {
    return {
      certificationProfile: {
        related: `/api/users/${user.id}/certification-profile`,
      },
      pixScore: {
        related: `/api/users/${user.id}/pixscore`
      },
      scorecards: {
        related: `/api/users/${user.id}/scorecards`
      },
      campaignParticipations: {
        related: `/api/users/${user.id}/campaign-participations`
      }
    };
  }
});
