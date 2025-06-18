import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (users, meta) {
  return new Serializer('user', {
    attributes: [
      'firstName',
      'lastName',
      'email',
      'emailConfirmed',
      'username',
      'cgu',
      'lastTermsOfServiceValidatedAt',
      'lastDataProtectionPolicySeenAt',
      'mustValidateTermsOfService',
      'lang',
      'isAnonymous',
      'anonymousUserToken',
      'accountInfo',
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
    accountInfo: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: { related: () => '/api/users/my-account' },
    },
    meta,
  }).serialize(users);
};

export const userWithActivitySerializer = { serialize };
