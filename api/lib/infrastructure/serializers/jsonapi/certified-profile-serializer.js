import { Serializer } from 'jsonapi-serializer';
import { kebabCase } from 'lodash';

const typeForAttribute = (attribute) => {
  return kebabCase(attribute);
};

const serialize = function (certifiedProfile) {
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
};

export { serialize };
