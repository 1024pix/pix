import _ from 'lodash';
const Joi = require('joi').extend(require('@joi/date'));
import { EntityValidationError } from '../errors';

const ABORT_REASONS = ['candidate', 'technical'];
const cpfImportStatus = {
  ERROR: 'ERROR',
  READY_TO_SEND: 'READY_TO_SEND',
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
};

class CertificationCourse {
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    birthplace,
    birthPostalCode,
    birthINSEECode,
    birthCountry,
    sex,
    externalId,
    hasSeenEndTestScreen,
    createdAt,
    completedAt,
    isPublished = false,
    isV2Certification = false,
    verificationCode,
    assessment,
    challenges,
    certificationIssueReports,
    userId,
    sessionId,
    maxReachableLevelOnCertificationDate,
    isCancelled = false,
    abortReason,
    complementaryCertificationCourses = [],
  } = {}) {
    this._id = id;
    this._firstName = firstName;
    this._lastName = lastName;
    this._birthdate = birthdate;
    this._birthplace = birthplace;
    this._birthPostalCode = birthPostalCode;
    this._birthINSEECode = birthINSEECode;
    this._birthCountry = birthCountry;
    this._sex = sex;
    this._externalId = externalId;
    this._hasSeenEndTestScreen = hasSeenEndTestScreen;
    this._createdAt = createdAt;
    this._completedAt = completedAt;
    this._isPublished = isPublished;
    this._isV2Certification = isV2Certification;
    this._verificationCode = verificationCode;
    this._assessment = assessment;
    this._challenges = challenges;
    this._certificationIssueReports = certificationIssueReports;
    this._userId = userId;
    this._sessionId = sessionId;
    this._maxReachableLevelOnCertificationDate = maxReachableLevelOnCertificationDate;
    this._isCancelled = isCancelled;
    this._abortReason = abortReason;
    this._complementaryCertificationCourses = complementaryCertificationCourses;
  }

  static from({
    certificationCandidate,
    challenges,
    verificationCode,
    maxReachableLevelOnCertificationDate,
    complementaryCertificationCourses,
  }) {
    return new CertificationCourse({
      userId: certificationCandidate.userId,
      sessionId: certificationCandidate.sessionId,
      firstName: certificationCandidate.firstName,
      lastName: certificationCandidate.lastName,
      birthdate: certificationCandidate.birthdate,
      birthPostalCode: certificationCandidate.birthPostalCode,
      birthINSEECode: certificationCandidate.birthINSEECode,
      birthCountry: certificationCandidate.birthCountry,
      sex: certificationCandidate.sex,
      birthplace: certificationCandidate.birthCity,
      externalId: certificationCandidate.externalId,
      isV2Certification: true,
      challenges,
      verificationCode,
      maxReachableLevelOnCertificationDate,
      complementaryCertificationCourses,
    });
  }

  withAssessment(assessment) {
    return new CertificationCourse({
      ...this.toDTO(),
      assessment: assessment,
    });
  }

  reportIssue(issueReport) {
    this._certificationIssueReports.push(issueReport);
  }

  cancel() {
    this._isCancelled = true;
  }

  uncancel() {
    this._isCancelled = false;
  }

  complete({ now }) {
    this._completedAt = now;
  }

  abort(reason) {
    const { error } = Joi.string()
      .valid(...ABORT_REASONS)
      .validate(reason);
    if (error)
      throw new EntityValidationError({
        invalidAttributes: [{ attribute: 'abortReason', message: error.message }],
      });
    this._abortReason = reason;
  }

  unabort() {
    this._abortReason = null;
  }

  correctFirstName(modifiedFirstName) {
    const sanitizedString = _sanitizedString(modifiedFirstName);
    if (_.isEmpty(sanitizedString)) {
      throw new EntityValidationError({
        invalidAttributes: [{ attribute: 'firstName', message: "Candidate's first name must not be blank or empty" }],
      });
    }
    this._firstName = sanitizedString;
  }

  correctLastName(modifiedLastName) {
    const sanitizedString = _sanitizedString(modifiedLastName);
    if (_.isEmpty(sanitizedString)) {
      throw new EntityValidationError({
        invalidAttributes: [{ attribute: 'lastName', message: "Candidate's last name must not be blank or empty" }],
      });
    }
    this._lastName = sanitizedString;
  }

  correctBirthplace(modifiedBirthplace) {
    const sanitizedString = _sanitizedString(modifiedBirthplace);
    if (!_.isEmpty(sanitizedString?.trim())) {
      this._birthplace = sanitizedString;
    }
  }

  correctSex(modifiedSex) {
    const sanitizedString = _sanitizedString(modifiedSex);
    if (!_.isEmpty(sanitizedString) && !['M', 'F'].includes(sanitizedString)) {
      throw new EntityValidationError({
        invalidAttributes: [{ attribute: 'sex', message: "Candidate's sex must be M or F" }],
      });
    }
    this._sex = sanitizedString;
  }

  correctBirthInformation({ birthCountry, birthCity, birthPostalCode, birthINSEECode }) {
    this._birthCountry = birthCountry;
    this._birthplace = birthCity;
    this._birthPostalCode = birthPostalCode;
    this._birthINSEECode = birthINSEECode;
  }

  correctBirthdate(modifiedBirthdate) {
    const { error } = Joi.date()
      .format('YYYY-MM-DD')
      .greater('1900-01-01')
      .required()
      .empty(null)
      .validate(modifiedBirthdate);
    if (error) {
      throw new EntityValidationError({
        invalidAttributes: [{ attribute: 'birthdate', message: "Candidate's birthdate must be a valid date" }],
      });
    }
    this._birthdate = modifiedBirthdate;
  }

  isCompleted() {
    return Boolean(this._completedAt);
  }

  isAbortReasonCandidateRelated() {
    return this._abortReason === 'candidate';
  }

  isAbortReasonCandidateUnrelated() {
    return this._abortReason === 'technical';
  }

  isPublished() {
    return this._isPublished;
  }

  doesBelongTo(userId) {
    return this._userId === userId;
  }

  getId() {
    return this._id;
  }

  getSessionId() {
    return this._sessionId;
  }

  toDTO() {
    return {
      id: this._id,
      firstName: this._firstName,
      lastName: this._lastName,
      birthdate: this._birthdate,
      birthplace: this._birthplace,
      birthPostalCode: this._birthPostalCode,
      birthINSEECode: this._birthINSEECode,
      birthCountry: this._birthCountry,
      sex: this._sex,
      externalId: this._externalId,
      hasSeenEndTestScreen: this._hasSeenEndTestScreen,
      createdAt: this._createdAt,
      completedAt: this._completedAt,
      isPublished: this._isPublished,
      isV2Certification: this._isV2Certification,
      verificationCode: this._verificationCode,
      assessment: this._assessment,
      challenges: this._challenges,
      certificationIssueReports: this._certificationIssueReports, // TODO : this.certificationIssueReports.toDTO()
      userId: this._userId,
      sessionId: this._sessionId,
      maxReachableLevelOnCertificationDate: this._maxReachableLevelOnCertificationDate,
      isCancelled: this._isCancelled,
      abortReason: this._abortReason,
      complementaryCertificationCourses: this._complementaryCertificationCourses,
    };
  }
}

function _sanitizedString(string) {
  const trimmedString = string?.trim();
  const multipleWhiteSpacesInARow = / +/g;
  const withUnifiedWithSpaces = trimmedString?.replace(multipleWhiteSpacesInARow, ' ');

  return withUnifiedWithSpaces;
}

CertificationCourse.cpfImportStatus = cpfImportStatus;

export default CertificationCourse;
