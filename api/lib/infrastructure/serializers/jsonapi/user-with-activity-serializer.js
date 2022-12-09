const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(users, meta) {
    return new Serializer('user', {
      attributes: [
        'firstName',
        'lastName',
        'email',
        'username',
        'cgu',
        'lastTermsOfServiceValidatedAt',
        'lastDataProtectionPolicySeenAt',
        'mustValidateTermsOfService',
        'pixOrgaTermsOfServiceAccepted',
        'pixCertifTermsOfServiceAccepted',
        'lang',
        'isAnonymous',
        'certificationCenterMemberships',
        'pixScore',
        'scorecards',
        'profile',
        'hasSeenAssessmentInstructions',
        'isCertifiable',
        'hasSeenNewDashboardInfo',
        'hasSeenFocusedChallengeTooltip',
        'hasSeenOtherChallengesTooltip',
        'hasAssessmentParticipations',
        'hasRecommendedTrainings',
        'codeForLastProfileToShare',
        'trainings',
      ],
      certificationCenterMemberships: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/users/${parent.id}/certification-center-memberships`;
          },
        },
      },
      pixScore: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/users/${parent.id}/pixscore`;
          },
        },
      },
      scorecards: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/users/${parent.id}/scorecards`;
          },
        },
      },
      profile: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/users/${parent.id}/profile`;
          },
        },
      },
      isCertifiable: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/users/${parent.id}/is-certifiable`;
          },
        },
      },
      trainings: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/users/${parent.id}/trainings`;
          },
        },
      },
      meta,
    }).serialize(users);
  },
};
