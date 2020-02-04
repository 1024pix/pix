import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attributes: [
    'firstName',
    'lastName',
    'email',
    'username',
    'cgu',
    'pixOrgaTermsOfServiceAccepted',
    'pixCertifTermsOfServiceAccepted',
    'hasSeenAssessmentInstructions',
  ],
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
      },
      certificationCenterMemberships: {
        related: `/api/users/${user.id}/certification-center-memberships`
      },
      memberships: {
        related: `/api/users/${user.id}/memberships`
      }
    };
  }
});
