import { Serializer } from 'jsonapi-serializer';

import { CertificationCenter } from '../../../domain/models/CertificationCenter.js';

const serialize = function (certificationCenters, meta) {
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
};

const deserialize = function (jsonAPI) {
  return new CertificationCenter({
    id: jsonAPI.data.id,
    name: jsonAPI.data.attributes.name,
    type: jsonAPI.data.attributes.type,
    externalId: jsonAPI.data.attributes['external-id'],
    createdAt: null,
    habilitations: [],
  });
};

export { serialize, deserialize };
