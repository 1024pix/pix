const { Serializer } = require('jsonapi-serializer');

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
  'firstName',
  'lastName',
  'birthdate',
  'birthplace',
  'isPublished',
  'date',
  'deliveredAt',
  'certificationCenter',
  'pixScore',
  'status',
  'status',
  'commentForCandidate',
  'resultCompetenceTree',
  'cleaCertificationStatus',
  'verificationCode',
  'maxReachableLevelOnCertificationDate',
];

module.exports = {

  serialize(certificate) {
    return new Serializer('certifications', {
      typeForAttribute,
      transform(privateCertificate) {
        privateCertificate.cleaCertificationStatus = privateCertificate.cleaCertificationResult.status;
        return privateCertificate;
      },
      attributes,
      resultCompetenceTree,
    }).serialize(certificate);
  },
};
