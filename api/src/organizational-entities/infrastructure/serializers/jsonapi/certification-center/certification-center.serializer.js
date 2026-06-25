import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (certificationCenters, meta) {
  return new Serializer('certification-center', {
    attributes: ['name', 'type', 'externalId', 'createdAt', 'habilitations'],
    typeForAttribute: (attribute) => {
      if (attribute === 'habilitations') return 'complementary-certifications';
    },
    habilitations: {
      include: true,
      ref: 'id',
      attributes: ['key', 'label'],
    },
    meta,
  }).serialize(certificationCenters);
};

export const certificationCenterSerializer = { serialize };
