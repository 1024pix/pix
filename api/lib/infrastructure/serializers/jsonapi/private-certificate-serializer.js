import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

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
  'certifiedBadgeImages',
  'verificationCode',
  'maxReachableLevelOnCertificationDate',
];

const serialize = function (certificate, { translate }) {
  return new Serializer('certifications', {
    transform(privateCertificate) {
      return {
        ...privateCertificate,
        commentForCandidate: privateCertificate.commentForCandidate.getComment(translate),
      };
    },
    typeForAttribute,
    attributes,
    resultCompetenceTree,
  }).serialize(certificate);
};

export { serialize };
