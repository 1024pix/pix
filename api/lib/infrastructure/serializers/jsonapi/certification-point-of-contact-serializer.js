const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(certificationPointOfContact) {
    return new Serializer('certification-point-of-contact', {

      attributes: [
        'firstName', 'lastName', 'email', 'pixCertifTermsOfServiceAccepted',
        'certificationCenterId', 'certificationCenterName',
        'certificationCenterType', 'certificationCenterExternalId', 'isRelatedOrganizationManagingStudents',
        'sessions',
      ],
      sessions: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related: function(record) {
            return `/api/certification-centers/${record.certificationCenterId}/sessions`;
          },
        },
      },
    }).serialize(certificationPointOfContact);
  },
};
