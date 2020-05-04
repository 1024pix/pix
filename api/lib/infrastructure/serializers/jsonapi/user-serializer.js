const { Serializer } = require('jsonapi-serializer');
const User = require('../../../domain/models/User');

module.exports = {

  serialize(users, meta) {
    return new Serializer('user', {
      transform: (untouchedUser) => {
        const user = Object.assign({}, untouchedUser);
        user.certificationProfile = undefined;
        if (!user.userOrgaSettings) {
          delete user.userOrgaSettings;
        }
        return user;
      },
      attributes: [
        'firstName', 'lastName', 'email', 'username',
        'cgu', 'lastTermsOfServiceValidatedAt', 'mustValidateTermsOfService',
        'pixOrgaTermsOfServiceAccepted', 'pixCertifTermsOfServiceAccepted',
        'memberships', 'certificationCenterMemberships',
        'pixScore', 'scorecards',
        'campaignParticipations', 'hasSeenAssessmentInstructions', 'certificationProfile',
        'userOrgaSettings'
      ],
      memberships: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/users/${parent.id}/memberships`;
          }
        }
      },
      certificationCenterMemberships: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function(record, current, parent) {
            return `/api/users/${parent.id}/certification-center-memberships`;
          }
        }
      },
      pixScore: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function(record, current, parent) {
            return `/api/users/${parent.id}/pixscore`;
          }
        }
      },
      scorecards: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function(record, current, parent) {
            return `/api/users/${parent.id}/scorecards`;
          }
        }
      },
      campaignParticipations: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function(record, current, parent) {
            return `/api/users/${parent.id}/campaign-participations`;
          }
        }
      },
      certificationProfile: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function(record, current, parent) {
            return `/api/users/${parent.id}/certification-profile`;
          }
        }
      },
      userOrgaSettings: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/users/${parent.id}/user-orga-settings`;
          }
        }
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
      password: json.data.attributes.password,
      cgu: json.data.attributes.cgu,
      lastTermsOfServiceValidatedAt: json.data.attributes['lastTermsOfServiceValidatedAt'],
      mustValidateTermsOfService: json.data.attributes['must-validate-terms-of-service'],
      pixOrgaTermsOfServiceAccepted: json.data.attributes['pix-orga-terms-of-service-accepted'],
      pixCertifTermsOfServiceAccepted: json.data.attributes['pix-certif-terms-of-service-accepted'],
    });
  }

};
