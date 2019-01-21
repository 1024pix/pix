const { Serializer } = require('jsonapi-serializer');
const User = require('../../../domain/models/User');

module.exports = {

  serialize(users, meta) {
    return new Serializer('user', {
      attributes: ['firstName', 'lastName', 'email', 'cgu', 'pixOrgaTermsOfServiceAccepted', 'pixCertifTermsOfServiceAccepted', 'memberships', 'certificationCenterMemberships'],
      memberships: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function(record, current, parent) {
            return `/users/${parent.id}/memberships`;
          }
        }
      },
      certificationCenterMemberships: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function(record, current, parent) {
            return `/users/${parent.id}/certification-center-memberships`;
          }
        }
      },
      transform(model) {
        // FIXME: Used to make it work in both cases
        return (model instanceof User) ? model : model.toJSON();
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
