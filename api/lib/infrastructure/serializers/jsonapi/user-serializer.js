const { Serializer } = require('jsonapi-serializer');
const User = require('../../../domain/models/User.js');

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
        'mustValidateTermsOfService',
        'pixOrgaTermsOfServiceAccepted',
        'pixCertifTermsOfServiceAccepted',
        'lang',
        'isAnonymous',
        'profile',
        'campaignParticipations',
        'hasSeenAssessmentInstructions',
        'isCertifiable',
        'hasSeenNewDashboardInfo',
        'hasSeenFocusedChallengeTooltip',
        'hasSeenOtherChallengesTooltip',
        'trainings',
        'lastDataProtectionPolicySeenAt',
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
      campaignParticipations: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/users/${parent.id}/campaign-participations`;
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

  deserialize(json) {
    return new User({
      id: json.data.id,
      firstName: json.data.attributes['first-name'],
      lastName: json.data.attributes['last-name'],
      email: json.data.attributes.email,
      cgu: json.data.attributes.cgu,
      lang: json.data.attributes.lang,
      lastTermsOfServiceValidatedAt: json.data.attributes['lastTermsOfServiceValidatedAt'],
      mustValidateTermsOfService: json.data.attributes['must-validate-terms-of-service'],
      pixOrgaTermsOfServiceAccepted: json.data.attributes['pix-orga-terms-of-service-accepted'],
      pixCertifTermsOfServiceAccepted: json.data.attributes['pix-certif-terms-of-service-accepted'],
    });
  },
};
