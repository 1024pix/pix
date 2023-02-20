import _ from 'lodash';
import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(certificationPointOfContact) {
    return new Serializer('certification-point-of-contact', {
      attributes: [
        'firstName',
        'lastName',
        'email',
        'pixCertifTermsOfServiceAccepted',
        'allowedCertificationCenterAccesses',
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
          'pixCertifScoBlockedAccessDateLycee',
          'pixCertifScoBlockedAccessDateCollege',
        ],
      },
      typeForAttribute: function (attribute) {
        if (attribute === 'allowedCertificationCenterAccesses') {
          return 'allowed-certification-center-access';
        }
        return attribute;
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
          }
        );

        return transformedCertificationPointOfContact;
      },
    }).serialize(certificationPointOfContact);
  },
};
