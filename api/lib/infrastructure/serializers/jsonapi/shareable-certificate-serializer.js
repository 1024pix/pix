const { Serializer } = require('jsonapi-serializer');

const typeForAttribute = (attribute) => {
  if (attribute === 'resultCompetenceTree') {
    return 'result-competence-trees';
  }
  if (attribute === 'resultCompetences') {
    return 'result-competences';
  }
};

const attributes = [
  'certificationCenter',
  'birthdate',
  'birthplace',
  'date',
  'firstName',
  'deliveredAt',
  'isPublished',
  'lastName',
  'status',
  'pixScore',
  'resultCompetenceTree',
  'cleaCertificationStatus',
  'maxReachableLevelOnCertificationDate',
];

const resultCompetenceTree = {
  included: true,
  ref: 'id',
  // XXX: the jsonapi-serializer lib needs at least one attribute outside relationships
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

module.exports = {

  serialize(certificate) {
    return new Serializer('certifications', {
      typeForAttribute,
      transform(shareableCertificate) {
        return {
          ...shareableCertificate,
          cleaCertificationStatus: shareableCertificate.cleaCertificationResult ?
            shareableCertificate.cleaCertificationResult.status : null,
        };
      },
      attributes,
      resultCompetenceTree,
    }).serialize(certificate);
  },
};
