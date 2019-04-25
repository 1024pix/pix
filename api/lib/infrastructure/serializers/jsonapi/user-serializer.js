const { Serializer } = require('jsonapi-serializer');
const User = require('../../../domain/models/User');

module.exports = {

  serialize(users, meta) {
    return new Serializer('user', {
      attributes: ['firstName', 'lastName', 'email', 'cgu', 'pixOrgaTermsOfServiceAccepted', 'pixCertifTermsOfServiceAccepted', 'memberships', 'certificationCenterMemberships', 'pixScore', 'scorecards'],
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
      meta
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
      pixOrgaTermsOfServiceAccepted: json.data.attributes['pix-orga-terms-of-service-accepted'],
      pixCertifTermsOfServiceAccepted: json.data.attributes['pix-certif-terms-of-service-accepted'],
    });
  }

};
