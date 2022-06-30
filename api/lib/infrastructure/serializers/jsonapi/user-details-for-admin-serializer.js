const { Serializer } = require('jsonapi-serializer');
const UserDetailsForAdmin = require('../../../domain/models/UserDetailsForAdmin');

module.exports = {
  serialize(usersDetailsForAdmin) {
    return new Serializer('user', {
      transform(record) {
        record.schoolingRegistrations = record.organizationLearners;
        record.profile = null;
        return record;
      },
      attributes: [
        'firstName',
        'lastName',
        'email',
        'username',
        'cgu',
        'pixOrgaTermsOfServiceAccepted',
        'pixCertifTermsOfServiceAccepted',
        'createdAt',
        'lang',
        'lastTermsOfServiceValidatedAt',
        'lastPixOrgaTermsOfServiceValidatedAt',
        'lastPixCertifTermsOfServiceValidatedAt',
        'lastLoggedAt',
        'emailConfirmedAt',
        'schoolingRegistrations',
        'organizationLearners',
        'authenticationMethods',
        'profile',
      ],
      schoolingRegistrations: {
        ref: 'id',
        includes: true,
        attributes: [
          'firstName',
          'lastName',
          'birthdate',
          'division',
          'group',
          'organizationId',
          'organizationName',
          'createdAt',
          'updatedAt',
          'isDisabled',
          'canBeDissociated',
        ],
      },
      organizationLearners: {
        ref: 'id',
        includes: true,
        attributes: [
          'firstName',
          'lastName',
          'birthdate',
          'division',
          'group',
          'organizationId',
          'organizationName',
          'createdAt',
          'updatedAt',
          'isDisabled',
          'canBeDissociated',
        ],
      },
      authenticationMethods: {
        ref: 'id',
        includes: true,
        attributes: ['identityProvider'],
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
    }).serialize(usersDetailsForAdmin);
  },

  serializeForUpdate(usersDetailsForAdmin) {
    return new Serializer('user', {
      transform(record) {
        record.schoolingRegistrations = record.organizationLearners;
        return record;
      },
      attributes: [
        'firstName',
        'lastName',
        'email',
        'username',
        'cgu',
        'pixOrgaTermsOfServiceAccepted',
        'pixCertifTermsOfServiceAccepted',
        'schoolingRegistrations',
        'organizationLearners',
        'authenticationMethods',
      ],
      schoolingRegistrations: {
        ref: 'id',
        includes: true,
        attributes: [
          'firstName',
          'lastName',
          'birthdate',
          'division',
          'group',
          'organizationId',
          'organizationName',
          'createdAt',
          'updatedAt',
          'isDisabled',
          'canBeDissociated',
        ],
      },
      organizationLearners: {
        ref: 'id',
        includes: true,
        attributes: [
          'firstName',
          'lastName',
          'birthdate',
          'division',
          'group',
          'organizationId',
          'organizationName',
          'createdAt',
          'updatedAt',
          'isDisabled',
          'canBeDissociated',
        ],
      },
      authenticationMethods: {
        ref: 'id',
        includes: true,
        attributes: ['identityProvider'],
      },
    }).serialize(usersDetailsForAdmin);
  },

  deserialize(json) {
    return new UserDetailsForAdmin({
      id: json.data.id,
      firstName: json.data.attributes['first-name'],
      lastName: json.data.attributes['last-name'],
      email: json.data.attributes.email,
      username: json.data.attributes.username,
    });
  },
};
