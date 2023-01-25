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
        'shouldSeeDataProtectionPolicyInformationBanner',
      ],
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
