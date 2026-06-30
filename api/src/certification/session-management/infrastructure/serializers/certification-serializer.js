import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer, Deserializer } = jsonapiSerializer;

import { WrongDateFormatError } from '../../../../shared/domain/errors.js';
import { isValidDate } from '../../../../shared/infrastructure/utils/date-utils.js';
import { CertificationCourse } from '../../../shared/domain/models/CertificationCourse.js';
import { NO_EXAMINER_COMMENT } from '../../../shared/domain/models/CertificationReport.js';

export function serializeFromCertificationCourse(certificationCourse) {
  return new Serializer('certifications', {
    transform: (certificationCourse) => certificationCourse.toDTO(),
    attributes: [
      'firstName',
      'lastName',
      'birthplace',
      'birthdate',
      'sex',
      'externalId',
      'birthINSEECode',
      'birthPostalCode',
      'birthCountry',
    ],
  }).serialize(certificationCourse);
}

export async function deserializeCertificationCandidateModificationCommand(json, certificationCourseId, userId) {
  const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
  const deserializedRawCommand = await deserializer.deserialize(json);
  if (deserializedRawCommand.birthdate) {
    if (!isValidDate(deserializedRawCommand.birthdate, 'YYYY-MM-DD')) {
      throw new WrongDateFormatError();
    }
  }
  return {
    firstName: deserializedRawCommand.firstName,
    lastName: deserializedRawCommand.lastName,
    birthplace: deserializedRawCommand.birthplace,
    birthdate: deserializedRawCommand.birthdate,
    birthCountry: deserializedRawCommand.birthCountry,
    birthPostalCode: deserializedRawCommand.birthPostalCode,
    sex: deserializedRawCommand.sex,
    birthINSEECode: deserializedRawCommand.birthInseeCode,
    userId,
    certificationCourseId,
  };
}

export function deserialize(json) {
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
}

function _isOmitted(aString) {
  return aString === undefined;
}

function _hasNoExaminerComment(aString) {
  return aString == null || aString.trim() === '';
}
