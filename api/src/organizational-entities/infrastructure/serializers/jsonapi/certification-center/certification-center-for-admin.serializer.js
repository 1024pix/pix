import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

import { CenterForAdmin } from '../../../../domain/models/CenterForAdmin.js';

const deserialize = function ({ data }) {
  const center = {
    createdAt: null,
    externalId: data.attributes['external-id'],
    habilitations: [],
    id: data.id,
    name: data.attributes.name,
    type: data.attributes.type,
    archivedAt: data.attributes['archived-at'],
    archivistFullName: data.attributes['archivist-full-name'],
    isComplementaryAlonePilot: data.attributes['is-complementary-alone-pilot'],
  };
  const dataProtectionOfficer = {
    firstName: data.attributes['data-protection-officer-first-name'],
    lastName: data.attributes['data-protection-officer-last-name'],
    email: data.attributes['data-protection-officer-email'],
  };

  return new CenterForAdmin({
    center,
    archivistFullName: center.archivistFullName,
    dataProtectionOfficer,
  });
};

const serialize = function (certificationCenter, certificationCenterPilotFeatures) {
  return new Serializer('certification-centers', {
    attributes: [
      'name',
      'type',
      'externalId',
      'createdAt',
      'archivedAt',
      'archivistFullName',
      'certificationCenterMemberships',
      'dataProtectionOfficerFirstName',
      'dataProtectionOfficerLastName',
      'dataProtectionOfficerEmail',
      'habilitations',
      'isComplementaryAlonePilot',
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
      ref: 'complementaryCertificationId',
      attributes: ['key', 'label'],
    },
  }).serialize({ ...certificationCenter, ...certificationCenterPilotFeatures });
};

export { deserialize, serialize };
