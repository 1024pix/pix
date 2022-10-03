const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(certificationCenters, meta) {
    return new Serializer('certification-centers', {
      attributes: [
        'name',
        'type',
        'externalId',
        'createdAt',
        'certificationCenterMemberships',
        'isSupervisorAccessEnabled',
        'dataProtectionOfficerFirstName',
        'dataProtectionOfficerLastName',
        'dataProtectionOfficerEmail',
        'habilitations',
      ],
      certificationCenterMemberships: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/admin/certification-centers/${parent.id}/certification-center-memberships`;
          },
        },
      },
      habilitations: {
        include: true,
        ref: 'id',
        attributes: ['key', 'label'],
      },
      meta,
    }).serialize(certificationCenters);
  },
};
