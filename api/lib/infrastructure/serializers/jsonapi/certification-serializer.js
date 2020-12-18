const _ = require('lodash');

const { Serializer, Deserializer } = require('jsonapi-serializer');

const { WrongDateFormatError } = require('../../../domain/errors');
const { NO_EXAMINER_COMMENT } = require('../../../domain/models/CertificationReport');
const { isValidDate } = require('../../utils/date-utils');

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
      attributes: [ ...attributes, 'commentForCandidate', 'verificationCode'],
      resultCompetenceTree,
    }).serialize(certificate);
  },

  serializeForSharing(certificate) {
    return new Serializer('certifications', {
      typeForAttribute,
      attributes,
      resultCompetenceTree,
    }).serialize(certificate);
  },

  serializeFromCertificationCourse(certificationCourse) {
    return new Serializer('certifications', {
      attributes: [
        'firstName',
        'lastName',
        'birthplace',
        'birthdate',
        'externalId',
        'maxReachableLevelOnCertificationDate',
      ],
    }).serialize(certificationCourse);
  },

  deserialize(json) {
    const birthdate = json.data.attributes.birthdate;

    return new Deserializer({ keyForAttribute: 'camelCase' })
      .deserialize(json)
      .then(((certifications) => {
        if (birthdate) {
          if (!isValidDate(birthdate, 'YYYY-MM-DD')) {
            return Promise.reject(new WrongDateFormatError());
          }
        }

        if (!_isOmitted(certifications.examinerComment) && _hasNoExaminerComment(certifications.examinerComment)) {
          certifications.examinerComment = NO_EXAMINER_COMMENT;
        }
        return certifications;
      }));
  },
};

function _isOmitted(aString) {
  return _.isUndefined(aString);
}

function _hasNoExaminerComment(aString) {
  return _.isEmpty(_.trim(aString));
}
