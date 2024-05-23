import JoiDate from '@joi/date';
import BaseJoi from 'joi';
import _ from 'lodash';

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { CertificationVersion } from './CertificationVersion.js';

const Joi = BaseJoi.extend(JoiDate);

export const ABORT_REASONS = {
  CANDIDATE: 'candidate',
  TECHNICAL: 'technical',
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
    numberOfChallenges,
    version = CertificationVersion.V2,
    isRejectedForFraud = false,
    lang,
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
    this._version = version;
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
    this._isRejectedForFraud = isRejectedForFraud;
    this._numberOfChallenges = numberOfChallenges;
    this._lang = lang;
  }

  static from({
    certificationCandidate,
    challenges,
    verificationCode,
    maxReachableLevelOnCertificationDate,
    complementaryCertificationCourses,
    numberOfChallenges,
    version,
    lang,
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
      challenges,
      numberOfChallenges,
      verificationCode,
      maxReachableLevelOnCertificationDate,
      complementaryCertificationCourses,
      version,
      lang,
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

  isCancelled() {
    return this._isCancelled;
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

  rejectForFraud() {
    this._isRejectedForFraud = true;
  }

  unrejectForFraud() {
    this._isRejectedForFraud = false;
  }

  isRejectedForFraud() {
    return this._isRejectedForFraud;
  }

  abort(reason) {
    const { error } = Joi.string()
      .valid(...Object.values(ABORT_REASONS))
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
    return this._abortReason === ABORT_REASONS.CANDIDATE;
  }

  isAbortReasonTechnical() {
    return this._abortReason === ABORT_REASONS.TECHNICAL;
  }

  isPublished() {
    return this._isPublished;
  }

  doesBelongTo(userId) {
    return this._userId === userId;
  }

  getAbortReason() {
    return this._abortReason;
  }

  getId() {
    return this._id;
  }

  getSessionId() {
    return this._sessionId;
  }

  getVersion() {
    return this._version;
  }

  getLanguage() {
    return this._lang;
  }

  getMaxReachableLevelOnCertificationDate() {
    return this._maxReachableLevelOnCertificationDate;
  }

  getStartDate() {
    return this._createdAt;
  }

  getNumberOfChallenges() {
    if (this.isV3()) {
      return this._numberOfChallenges;
    }

    return this._challenges?.length ?? 0;
  }

  isV3() {
    return this._version === CertificationVersion.V3;
  }

  static isLanguageAvailableForV3Certification(languageService, candidateLanguage) {
    return languageService.isLanguageAvailableForV3Certification(candidateLanguage);
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
      isRejectedForFraud: this._isRejectedForFraud,
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
      numberOfChallenges: this._numberOfChallenges,
      version: this._version,
      lang: this._lang,
    };
  }
}

function _sanitizedString(string) {
  const trimmedString = string?.trim();
  const multipleWhiteSpacesInARow = / +/g;
  const withUnifiedWithSpaces = trimmedString?.replace(multipleWhiteSpacesInARow, ' ');

  return withUnifiedWithSpaces;
}

export { CertificationCourse };
