import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (certificationCenters, meta) {
  return new Serializer('certification-center', {
    attributes: ['name', 'type', 'externalId', 'createdAt', 'certificationCenterMemberships', 'habilitations'],
    typeForAttribute: (attribute) => {
      if (attribute === 'habilitations') return 'complementary-certifications';
    },
    certificationCenterMemberships: {
      ref: 'id',
      ignoreRelationshipData: true,
      nullIfMissing: true,
      relationshipLinks: {
        related(record, current, parent) {
          return `/api/certification-centers/${parent.id}/certification-center-memberships`;
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
};

export { serialize };
