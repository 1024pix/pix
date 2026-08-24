import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

function typeForAttribute(attribute) {
  return attribute
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function serialize(certifiedProfile) {
  return new Serializer('certified-profiles', {
    typeForAttribute,
    attributes: ['userId', 'certifiedSkills', 'certifiedTubes', 'certifiedCompetences', 'certifiedAreas'],
    certifiedSkills: {
      ref: 'id',
      included: true,
      attributes: ['name', 'tubeId', 'hasBeenAskedInCertif', 'difficulty'],
    },
    certifiedTubes: {
      ref: 'id',
      included: true,
      attributes: ['name', 'competenceId'],
    },
    certifiedCompetences: {
      ref: 'id',
      included: true,
      attributes: ['name', 'areaId', 'origin'],
    },
    certifiedAreas: {
      ref: 'id',
      included: true,
      attributes: ['name', 'color'],
    },
  }).serialize(certifiedProfile);
}
