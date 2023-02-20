import { Serializer } from 'jsonapi-serializer';
import CertificationCenter from '../../../domain/models/CertificationCenter';

export default {
  serialize(certificationCenters, meta) {
    return new Serializer('certification-center', {
      attributes: ['name', 'type', 'externalId', 'createdAt', 'certificationCenterMemberships', 'habilitations'],
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
  },

  deserialize(jsonAPI) {
    return new CertificationCenter({
      id: jsonAPI.data.id,
      name: jsonAPI.data.attributes.name,
      type: jsonAPI.data.attributes.type,
      externalId: jsonAPI.data.attributes['external-id'],
      createdAt: null,
      habilitations: [],
    });
  },
};
