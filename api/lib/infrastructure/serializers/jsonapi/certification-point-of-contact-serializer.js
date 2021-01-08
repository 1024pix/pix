const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(certificationPointOfContact) {
    return new Serializer('certification-point-of-contact', {
      attributes: [
        'firstName', 'lastName', 'email', 'pixCertifTermsOfServiceAccepted', 'currentCertificationCenterId',
        'certificationCenters', 'sessions',
      ],
      certificationCenters: {
        ref: 'id',
        included: true,
        attributes: [
          'name', 'type', 'externalId', 'isRelatedOrganizationManagingStudents',
        ],
      },
      sessions: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related: function(record) {
            return `/api/certification-centers/${record.currentCertificationCenterId}/sessions`;
          },
        },
      },
    }).serialize(certificationPointOfContact);
  },
};
