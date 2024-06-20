import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

import { CenterForAdmin } from '../../../../src/certification/enrolment/domain/models/CenterForAdmin.js';

const deserialize = function ({ data }) {
  const center = {
    createdAt: null,
    externalId: data.attributes['external-id'],
    habilitations: [],
    id: data.id,
    name: data.attributes.name,
    type: data.attributes.type,
    isV3Pilot: data.attributes['is-v3-pilot'],
    isComplementaryAlonePilot: data.attributes['is-complementary-alone-pilot'],
  };
  const dataProtectionOfficer = {
    firstName: data.attributes['data-protection-officer-first-name'],
    lastName: data.attributes['data-protection-officer-last-name'],
    email: data.attributes['data-protection-officer-email'],
  };

  return new CenterForAdmin({
    center,
    dataProtectionOfficer,
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
    meta,
  }).serialize(certificationCenters);
};

export { deserialize, serialize };
