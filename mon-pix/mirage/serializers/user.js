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
  ],
  include: ['competences'],
  links(user) {
    const userBaseUrl = `/api/users/${user.id}`;
    return {
      isCertifiable: {
        related: `${userBaseUrl}/is-certifiable`,
      },
      pixScore: {
        related: `${userBaseUrl}/pixscore`,
      },
      scorecards: {
        related: `${userBaseUrl}/scorecards`,
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
      certificationCenterMemberships: {
        related: `${userBaseUrl}/certification-center-memberships`,
      },
      memberships: {
        related: `${userBaseUrl}/memberships`,
      },
    };
  },
});
