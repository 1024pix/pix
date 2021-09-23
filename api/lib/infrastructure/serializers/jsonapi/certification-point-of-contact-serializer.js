const _ = require('lodash');
const { Serializer } = require('jsonapi-serializer');

module.exports = {

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
        ],
      },
      typeForAttribute: function(attribute) {
        if (attribute === 'allowedCertificationCenterAccesses') {
          return 'allowed-certification-center-access';
        }
        return attribute;
      },
      transform(certificationPointOfContact) {
        const transformedCertificationPointOfContact = _.clone(certificationPointOfContact);
        transformedCertificationPointOfContact.allowedCertificationCenterAccesses = _.map(certificationPointOfContact.allowedCertificationCenterAccesses, (access) => {
          return {
            ...access,
            isAccessBlockedCollege: access.isAccessBlockedCollege(),
            isAccessBlockedLycee: access.isAccessBlockedLycee(),
            isAccessBlockedAEFE: access.isAccessBlockedAEFE(),
            isAccessBlockedAgri: access.isAccessBlockedAgri(),
          };
        });

        return transformedCertificationPointOfContact;
      },
    }).serialize(certificationPointOfContact);
  },
};
