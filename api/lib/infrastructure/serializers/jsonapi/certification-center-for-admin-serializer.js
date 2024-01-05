import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

import { CertificationCenterForAdmin } from '../../../domain/models/CertificationCenterForAdmin.js';

const deserialize = function ({ data }) {
  return new CertificationCenterForAdmin({
    createdAt: null,
    dataProtectionOfficerFirstName: data.attributes['data-protection-officer-first-name'],
    dataProtectionOfficerLastName: data.attributes['data-protection-officer-last-name'],
    dataProtectionOfficerEmail: data.attributes['data-protection-officer-email'],
    externalId: data.attributes['external-id'],
    habilitations: [],
    id: data.id,
    name: data.attributes.name,
    type: data.attributes.type,
  });
};

const serialize = function (certificationCenters, meta) {
  return new Serializer('certification-centers', {
    attributes: [
      'name',
      'type',
      'externalId',
      'createdAt',
      'certificationCenterMemberships',
      'dataProtectionOfficerFirstName',
      'dataProtectionOfficerLastName',
      'dataProtectionOfficerEmail',
      'habilitations',
      'isV3Pilot',
    ],
    typeForAttribute: (attribute) => {
      if (attribute === 'habilitations') return 'complementary-certifications';
    },
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
};

export { deserialize, serialize };
