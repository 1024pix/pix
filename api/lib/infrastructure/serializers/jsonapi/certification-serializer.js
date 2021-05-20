const _ = require('lodash');

const { Serializer, Deserializer } = require('jsonapi-serializer');

const { WrongDateFormatError } = require('../../../domain/errors');
const { NO_EXAMINER_COMMENT } = require('../../../domain/models/CertificationReport');
const { isValidDate } = require('../../utils/date-utils');
const CertificationCourse = require('../../../domain/models/CertificationCourse');

module.exports = {

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
      .then(((certification) => {
        if (birthdate) {
          if (!isValidDate(birthdate, 'YYYY-MM-DD')) {
            return Promise.reject(new WrongDateFormatError());
          }
        }

        const certificationDomainModel = new CertificationCourse(certification);

        if (!_isOmitted(certification.examinerComment) && _hasNoExaminerComment(certification.examinerComment)) {
          certificationDomainModel.examinerComment = NO_EXAMINER_COMMENT;
        }
        return certificationDomainModel;
      }));
  },
};

function _isOmitted(aString) {
  return _.isUndefined(aString);
}

function _hasNoExaminerComment(aString) {
  return _.isEmpty(_.trim(aString));
}
