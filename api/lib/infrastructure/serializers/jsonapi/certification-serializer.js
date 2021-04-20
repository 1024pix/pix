const _ = require('lodash');

const { Serializer, Deserializer } = require('jsonapi-serializer');

const { WrongDateFormatError } = require('../../../domain/errors');
const { NO_EXAMINER_COMMENT } = require('../../../domain/models/CertificationReport');
const { isValidDate } = require('../../utils/date-utils');

module.exports = {

  serialize(certificationCourse) {
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
