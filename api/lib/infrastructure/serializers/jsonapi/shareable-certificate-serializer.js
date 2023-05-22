import { Serializer } from 'jsonapi-serializer';

const typeForAttribute = (attribute) => {
  if (attribute === 'resultCompetenceTree') {
    return 'result-competence-trees';
  }
  if (attribute === 'resultCompetences') {
    return 'result-competences';
  }
};

const resultCompetenceTree = {
  included: true,
  ref: 'id',
  attributes: ['id', 'areas'],

  areas: {
    included: true,
    ref: 'id',
    attributes: ['code', 'name', 'title', 'color', 'resultCompetences'],

    resultCompetences: {
      included: true,
      ref: 'id',
      type: 'result-competences',
      attributes: ['index', 'level', 'name', 'score'],
    },
  },
};

const attributes = [
  'certificationCenter',
  'birthdate',
  'birthplace',
  'date',
  'firstName',
  'deliveredAt',
  'isPublished',
  'isCancelled',
  'lastName',
  'pixScore',
  'resultCompetenceTree',
  'certifiedBadgeImages',
  'maxReachableLevelOnCertificationDate',
];

const serialize = function (certificate) {
  return new Serializer('certifications', {
    typeForAttribute,
    attributes,
    resultCompetenceTree,
  }).serialize(certificate);
};

export { serialize };
