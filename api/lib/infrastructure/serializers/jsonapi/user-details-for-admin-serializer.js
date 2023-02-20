import { Serializer } from 'jsonapi-serializer';
import UserDetailsForAdmin from '../../../domain/models/UserDetailsForAdmin';

export default {
  serialize(usersDetailsForAdmin) {
    return new Serializer('user', {
      transform(record) {
        record.profile = null;
        record.participations = null;
        record.organizationMemberships = null;
        record.certificationCenterMemberships = null;
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
        'hasBeenAnonymised',
        'anonymisedByFullName',
        'organizationLearners',
        'authenticationMethods',
        'profile',
        'participations',
        'organizationMemberships',
        'certificationCenterMemberships',
        'userLogin',
      ],
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
        attributes: ['identityProvider', 'authenticationComplement'],
      },
      userLogin: {
        ref: 'id',
        includes: true,
        attributes: ['blockedAt', 'temporaryBlockedUntil', 'failureCount'],
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
      participations: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/admin/users/${parent.id}/participations`;
          },
        },
      },
      organizationMemberships: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/admin/users/${parent.id}/organizations`;
          },
        },
      },
      certificationCenterMemberships: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function (record, current, parent) {
            return `/api/admin/users/${parent.id}/certification-center-memberships`;
          },
        },
      },
    }).serialize(usersDetailsForAdmin);
  },

  serializeForUpdate(usersDetailsForAdmin) {
    return new Serializer('user', {
      attributes: [
        'firstName',
        'lastName',
        'email',
        'username',
        'cgu',
        'pixOrgaTermsOfServiceAccepted',
        'pixCertifTermsOfServiceAccepted',
        'organizationLearners',
        'authenticationMethods',
      ],
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
      userLogin: {
        ref: 'id',
        includes: true,
        attributes: ['blockedAt', 'createdAt', 'updatedAt', 'temporaryBlockedUntil', 'failureCount'],
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
