import _ from 'lodash';
import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer, Deserializer } = jsonapiSerializer;

import { WrongDateFormatError } from '../../../domain/errors.js';
import { NO_EXAMINER_COMMENT } from '../../../../src/certification/shared/domain/models/CertificationReport.js';
import { isValidDate } from '../../../../src/shared/infrastructure/utils/date-utils.js';
import { CertificationCourse } from '../../../domain/models/CertificationCourse.js';

const serializeFromCertificationCourse = function (certificationCourse) {
  return new Serializer('certifications', {
    transform: (certificationCourse) => {
      return {
        ..._.omit(certificationCourse.toDTO(), 'maxReachableLevelOnCertificationDate'),
      };
    },
    attributes: [
      'firstName',
      'lastName',
      'birthplace',
      'birthdate',
      'sex',
      'externalId',
      'maxReachableLevelOnCertificationDate',
      'birthINSEECode',
      'birthPostalCode',
      'birthCountry',
    ],
  }).serialize(certificationCourse);
};

const deserializeCertificationCandidateModificationCommand = async function (json, certificationCourseId, userId) {
  const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
  const deserializedRawCommand = await deserializer.deserialize(json);
  if (deserializedRawCommand.birthdate) {
    if (!isValidDate(deserializedRawCommand.birthdate, 'YYYY-MM-DD')) {
      throw new WrongDateFormatError();
    }
  }
  return {
    ..._.pick(deserializedRawCommand, [
      'firstName',
      'lastName',
      'birthplace',
      'birthdate',
      'birthCountry',
      'birthPostalCode',
      'sex',
    ]),
    birthINSEECode: deserializedRawCommand.birthInseeCode,
    userId,
    certificationCourseId,
  };
};

const deserialize = function (json) {
  const birthdate = json.data.attributes.birthdate;

  return new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(json).then((certification) => {
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
  });
};

export { serializeFromCertificationCourse, deserializeCertificationCandidateModificationCommand, deserialize };

function _isOmitted(aString) {
  return _.isUndefined(aString);
}

function _hasNoExaminerComment(aString) {
  return _.isEmpty(_.trim(aString));
}
