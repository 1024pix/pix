import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attributes: [
    'firstName',
    'lastName',
    'email',
    'username',
    'cgu',
    'lang',
    'pixCertifTermsOfServiceAccepted',
    'hasSeenAssessmentInstructions',
    'hasSeenNewDashboardInfo',
    'isAnonymous',
    'hasRecommendedTrainings',
  ],
  include: ['competences'],
  links(user) {
    const userBaseUrl = `/api/users/${user.id}`;
    return {
      accountInfo: {
        related: '/api/users/my-account',
      },
      isCertifiable: {
        related: `${userBaseUrl}/is-certifiable`,
      },
      profile: {
        related: `${userBaseUrl}/profile`,
      },
      campaignParticipations: {
        related: `${userBaseUrl}/campaign-participations`,
      },
      campaignParticipationOverviews: {
        related: `${userBaseUrl}/campaign-participation-overviews`,
      },
      memberships: {
        related: `${userBaseUrl}/memberships`,
      },
      trainings: {
        related: `${userBaseUrl}/trainings`,
      },
    };
  },
});
