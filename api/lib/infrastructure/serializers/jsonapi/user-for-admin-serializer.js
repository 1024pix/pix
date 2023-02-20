import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(users, meta) {
    return new Serializer('user', {
      transform(record) {
        record.profile = null;
        return record;
      },
      attributes: [
        'firstName',
        'lastName',
        'email',
        'username',
        'cgu',
        'lastTermsOfServiceValidatedAt',
        'mustValidateTermsOfService',
        'pixOrgaTermsOfServiceAccepted',
        'pixCertifTermsOfServiceAccepted',
        'lang',
        'isAnonymous',
        'memberships',
        'certificationCenterMemberships',
        'pixScore',
        'scorecards',
        'profile',
        'campaignParticipations',
        'hasSeenAssessmentInstructions',
        'isCertifiable',
        'hasSeenNewDashboardInfo',
        'hasSeenFocusedChallengeTooltip',
        'hasSeenOtherChallengesTooltip',
      ],
      memberships: {
        ref: 'id',
        ignoreRelationshipData: true,
      },
      certificationCenterMemberships: {
        ref: 'id',
        ignoreRelationshipData: true,
      },
      pixScore: {
        ref: 'id',
        ignoreRelationshipData: true,
      },
      scorecards: {
        ref: 'id',
        ignoreRelationshipData: true,
      },
      profile: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/admin/users/${parent.id}/profile`;
          },
        },
      },
      campaignParticipations: {
        ref: 'id',
        ignoreRelationshipData: true,
      },
      isCertifiable: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
      },
      meta,
    }).serialize(users);
  },
};
