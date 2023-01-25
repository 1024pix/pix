import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attributes: [
    'firstName',
    'lastName',
    'email',
    'username',
    'cgu',
    'lang',
    'pixOrgaTermsOfServiceAccepted',
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
