const { Serializer } = require('jsonapi-serializer');

const CertificationCenter = require('../../../domain/models/CertificationCenter');

module.exports = {

  serialize(certificationCenters, meta) {
    return new Serializer('certification-center', {
      attributes: [
        'id', 'name', 'type', 'externalId', 'createdAt', 'certificationCenterMemberships',
      ],
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
      meta,
    }).serialize(certificationCenters);
  },

  deserialize(jsonAPI) {
    return new CertificationCenter({
      id: jsonAPI.data.id,
      name: jsonAPI.data.attributes.name,
      type: jsonAPI.data.attributes.type,
      externalId: jsonAPI.data.attributes['external-id'],
    });
  },
};
