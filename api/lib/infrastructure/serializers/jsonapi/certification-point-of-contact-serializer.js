const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(certificationPointOfContact) {
    return new Serializer('certification-point-of-contact', {
      attributes: [
        'firstName', 'lastName', 'email', 'pixCertifTermsOfServiceAccepted', 'currentCertificationCenterId',
        'certificationCenters',
      ],
      certificationCenters: {
        ref: 'id',
        included: true,
        attributes: [
          'name', 'type', 'externalId', 'isRelatedOrganizationManagingStudents',
        ],
      },
    }).serialize(certificationPointOfContact);
  },
};
