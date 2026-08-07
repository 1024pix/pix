import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

function typeForAttribute(attribute) {
  if (attribute === 'resultCompetenceTree') {
    return 'result-competence-trees';
  }
  if (attribute === 'resultCompetences') {
    return 'result-competences';
  }
}

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
  'firstName',
  'lastName',
  'birthdate',
  'birthplace',
  'date',
  'deliveredAt',
  'certificationCenter',
  'isPublished',
  'pixScore',
  'resultCompetenceTree',
  'certifiedBadgeImages',
  'maxReachableLevelOnCertificationDate',
  'version',
  'algorithmEngineVersion',
  'globalLevelLabel',
  'globalSummaryLabel',
  'globalDescriptionLabel',
  'level',
  'certificationFramework',
  'certificationDate',
  'verificationCode',
  'acquiredComplementaryCertification',
  'badgeUrl',
];

export function serialize({ certificate, translate, context }) {
  let globalLevel = {};

  if (certificate?.globalLevel) {
    globalLevel = {
      globalLevelLabel: certificate.globalLevel.getLevelLabel(translate),
      globalSummaryLabel: certificate.globalLevel.getSummaryLabel(translate, context),
      globalDescriptionLabel: certificate.globalLevel.getDescriptionLabel(translate, context),
      level: _getLevel(certificate),
    };
  }
  return new Serializer('certifications', {
    transform(certificate) {
      return {
        ...certificate,
        ...globalLevel,
        acquiredComplementaryCertification: certificate.acquiredComplementaryCertification?.imageUrl,
        badgeUrl: certificate.badgeUrl,
      };
    },
    typeForAttribute,
    attributes,
    resultCompetenceTree,
  }).serialize(certificate);
}

function _getLevel(certificate) {
  return certificate.globalLevel.meshLevel.split('_').at(-1);
}
