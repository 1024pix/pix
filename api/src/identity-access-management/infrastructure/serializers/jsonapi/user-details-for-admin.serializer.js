import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

import { UserDetailsForAdmin } from '../../../domain/models/UserDetailsForAdmin.js';

const serialize = function (usersDetailsForAdmin) {
  return new Serializer('user', {
    transform(record) {
      record.profile = null;
      record.participations = null;
      record.organizationMemberships = null;
      record.certificationCenterMemberships = null;
      record.certificationCourses = null;
      return record;
    },
    attributes: [
      'firstName',
      'lastName',
      'email',
      'username',
      'cgu',
      'pixAppTermsOfServiceAccepted',
      'pixOrgaTermsOfServiceAccepted',
      'pixCertifTermsOfServiceAccepted',
      'createdAt',
      'lang',
      'locale',
      'lastPixAppTermsOfServiceValidatedAt',
      'lastPixOrgaTermsOfServiceValidatedAt',
      'lastPixCertifTermsOfServiceValidatedAt',
      'lastLoggedAt',
      'emailConfirmedAt',
      'hasBeenAnonymised',
      'hasBeenAnonymisedBy',
      'anonymisedByFullName',
      'organizationLearners',
      'authenticationMethods',
      'lastApplicationConnections',
      'profile',
      'participations',
      'organizationMemberships',
      'certificationCenterMemberships',
      'certificationCourses',
      'userLogin',
      'isPixAgent',
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
      attributes: ['identityProvider', 'authenticationComplement', 'lastLoggedAt'],
    },
    lastApplicationConnections: {
      ref: 'id',
      includes: true,
      attributes: ['application', 'lastLoggedAt'],
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
    certificationCourses: {
      ref: 'id',
      ignoreRelationshipData: true,
      relationshipLinks: {
        related: function (record, current, parent) {
          return `/api/admin/users/${parent.id}/certification-courses`;
        },
      },
    },
  }).serialize(usersDetailsForAdmin);
};

const serializeForUpdate = function (usersDetailsForAdmin) {
  return new Serializer('user', {
    attributes: [
      'firstName',
      'lastName',
      'email',
      'username',
      'lang',
      'locale',
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
};

const deserialize = function (json) {
  return new UserDetailsForAdmin({
    id: json.data.id,
    firstName: json.data.attributes['first-name'],
    lastName: json.data.attributes['last-name'],
    email: json.data.attributes.email,
    username: json.data.attributes.username,
    lang: json.data.attributes.lang,
    locale: json.data.attributes.locale,
  });
};

export { deserialize, serialize, serializeForUpdate };
