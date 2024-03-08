import jsonapiSerializer from 'jsonapi-serializer';
import _ from 'lodash';

const { Serializer } = jsonapiSerializer;

const ALLOWED_CERTIFICATION_CENTER_ACCESS_ATTRIBUTE = 'allowedCertificationCenterAccesses';
const ALLOWED_CERTIFICATION_CENTER_ACCESS_TYPE = 'allowed-certification-center-access';

const CERTIFICATION_CENTER_MEMBERSHIP_ATTRIBUTE = 'certificationCenterMemberships';
const CERTIFICATION_CENTER_MEMBERSHIP_TYPE = 'certification-center-membership';

const serialize = function (certificationPointOfContact) {
  return new Serializer('certification-point-of-contact', {
    attributes: [
      'firstName',
      'lastName',
      'email',
      'lang',
      'pixCertifTermsOfServiceAccepted',
      'allowedCertificationCenterAccesses',
      CERTIFICATION_CENTER_MEMBERSHIP_ATTRIBUTE,
    ],
    allowedCertificationCenterAccesses: {
      ref: 'id',
      included: true,
      attributes: [
        'name',
        'externalId',
        'type',
        'isRelatedToManagingStudentsOrganization',
        'isAccessBlockedCollege',
        'isAccessBlockedLycee',
        'isAccessBlockedAEFE',
        'isAccessBlockedAgri',
        'relatedOrganizationTags',
        'habilitations',
        'isV3Pilot',
        'pixCertifScoBlockedAccessDateLycee',
        'pixCertifScoBlockedAccessDateCollege',
      ],
    },
    certificationCenterMemberships: {
      ref: 'id',
      included: true,
      attributes: ['certificationCenterId', 'userId', 'role'],
    },
    typeForAttribute: function (attribute) {
      switch (attribute) {
        case ALLOWED_CERTIFICATION_CENTER_ACCESS_ATTRIBUTE:
          return ALLOWED_CERTIFICATION_CENTER_ACCESS_TYPE;
        case CERTIFICATION_CENTER_MEMBERSHIP_ATTRIBUTE:
          return CERTIFICATION_CENTER_MEMBERSHIP_TYPE;
        default:
          return attribute;
      }
    },
    transform(certificationPointOfContact) {
      const transformedCertificationPointOfContact = _.clone(certificationPointOfContact);
      transformedCertificationPointOfContact.allowedCertificationCenterAccesses = _.map(
        certificationPointOfContact.allowedCertificationCenterAccesses,
        (access) => {
          return {
            ...access,
            habilitations: access.habilitations,
            isAccessBlockedCollege: access.isAccessBlockedCollege(),
            isAccessBlockedLycee: access.isAccessBlockedLycee(),
            isAccessBlockedAEFE: access.isAccessBlockedAEFE(),
            isAccessBlockedAgri: access.isAccessBlockedAgri(),
            pixCertifScoBlockedAccessDateCollege: access.pixCertifScoBlockedAccessDateCollege,
            pixCertifScoBlockedAccessDateLycee: access.pixCertifScoBlockedAccessDateLycee,
          };
        },
      );

      return transformedCertificationPointOfContact;
    },
  }).serialize(certificationPointOfContact);
};

export { serialize };
