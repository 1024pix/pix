const { Serializer } = require('jsonapi-serializer');
const AssessmentResult = require('../../../domain/models/AssessmentResult');

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
  'status',
  'pixScore',
  'resultCompetenceTree',
  'cleaCertificationStatus',
  'maxReachableLevelOnCertificationDate',
];

module.exports = {

  serialize(certificate) {
    return new Serializer('certifications', {
      typeForAttribute,
      transform(shareableCertificate) {
        shareableCertificate.cleaCertificationStatus = shareableCertificate.cleaCertificationResult.status;
        shareableCertificate.status = AssessmentResult.status.VALIDATED;
        return shareableCertificate;
      },
      attributes,
      resultCompetenceTree,
    }).serialize(certificate);
  },
};
