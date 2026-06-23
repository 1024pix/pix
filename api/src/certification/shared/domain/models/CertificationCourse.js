/**
 * @typedef {import('../../../../shared/domain/models/Assessment.js').Assessment} Assessment
 * @typedef {import('../../../../shared/domain/models/Challenge.js').Challenge} Challenge
 * @typedef {import('./CertificationIssueReport.js').CertificationIssueReport} CertificationIssueReport
 * @typedef {import('../../../session-management/domain/models/ComplementaryCertificationCourse.js').ComplementaryCertificationCourse} ComplementaryCertificationCourse
 * @typedef {import('./AlgorithmEngineVersion.js').AlgorithmEngineVersion} AlgorithmEngineVersion
 */
import JoiDate from '@joi/date';
import BaseJoi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import isEmpty from '../../../../shared/infrastructure/utils/is-empty.js';
import { ABORT_REASONS } from '../constants/abort-reasons.js';
import { AlgorithmEngineVersion } from './AlgorithmEngineVersion.js';

const Joi = BaseJoi.extend(JoiDate);

export const V3_CERTIFICATION_AVAILABLE_LOCALES = ['fr-fr', 'fr'];

export class CertificationCourse {
  /**
   * @param {object} props
   * @param {number} props.id
   * @param {string} props.firstName
   * @param {string} props.lastName
   * @param {Date} props.birthdate
   * @param {string} props.birthplace
   * @param {string} props.birthPostalCode
   * @param {string} props.birthINSEECode
   * @param {string} props.birthCountry
   * @param {string} props.sex
   * @param {number} props.externalId
   * @param {Date} props.createdAt
   * @param {boolean} props.isPublished
   * @param {string} props.verificationCode
   * @param {Assessment} props.assessment
   * @param {Array<Challenge>} props.challenges
   * @param {Array<CertificationIssueReport>} props.certificationIssueReports
   * @param {number} props.userId
   * @param {number} props.sessionId
   * @param {Date} props.maxReachableLevelOnCertificationDate
   * @param {ABORT_REASONS} props.abortReason
   * @param {ComplementaryCertificationCourse} props.complementaryCertificationCourse
   * @param {number} props.numberOfChallenges
   * @param {AlgorithmEngineVersion} props.version
   * @param {boolean} props.isRejectedForFraud
   * @param {boolean} props.isAdjustedForAccessibility
   * @param {string} props.lang
   * @param {Date} props.lastAnswerAt
   */
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
    createdAt,
    isPublished = false,
    verificationCode,
    assessment,
    challenges,
    certificationIssueReports,
    userId,
    sessionId,
    maxReachableLevelOnCertificationDate,
    abortReason,
    complementaryCertificationCourse = null,
    numberOfChallenges,
    version = AlgorithmEngineVersion.V2,
    isRejectedForFraud = false,
    isAdjustedForAccessibility,
    lang,
    versionId,
    candidateId,
    framework,
    lastAnswerAt,
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
    this._createdAt = createdAt;
    this._isPublished = isPublished;
    this._version = version;
    this._verificationCode = verificationCode;
    this._assessment = assessment;
    this._challenges = challenges;
    this._certificationIssueReports = certificationIssueReports;
    this._userId = userId;
    this._sessionId = sessionId;
    this._maxReachableLevelOnCertificationDate = maxReachableLevelOnCertificationDate;
    this._abortReason = abortReason;
    this._complementaryCertificationCourse = complementaryCertificationCourse;
    this._isRejectedForFraud = isRejectedForFraud;
    this._isAdjustedForAccessibility = isAdjustedForAccessibility;
    this._numberOfChallenges = numberOfChallenges;
    this._lang = lang;
    this.versionId = versionId;
    this.candidateId = candidateId;
    this.framework = framework;
    this.lastAnswerAt = lastAnswerAt;
  }

  static from({
    candidate,
    certificationVersion,
    challenges,
    verificationCode,
    complementaryCertificationCourse,
    numberOfChallenges,
    algorithmEngineVersion,
    lang,
    framework,
    lastAnswerAt,
  }) {
    return new CertificationCourse({
      candidateId: candidate.id,
      userId: candidate.userId,
      sessionId: candidate.sessionId,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      birthdate: candidate.birthdate,
      birthPostalCode: candidate.birthPostalCode,
      birthINSEECode: candidate.birthINSEECode,
      birthCountry: candidate.birthCountry,
      sex: candidate.sex,
      birthplace: candidate.birthCity,
      externalId: candidate.externalId,
      isAdjustedForAccessibility: candidate.accessibilityAdjustmentNeeded,
      challenges,
      numberOfChallenges,
      verificationCode,
      complementaryCertificationCourse,
      version: algorithmEngineVersion,
      lang,
      versionId: certificationVersion.id,
      framework,
      lastAnswerAt,
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

  rejectForFraud() {
    this._isRejectedForFraud = true;
  }

  unrejectForFraud() {
    this._isRejectedForFraud = false;
  }

  isRejectedForFraud() {
    return this._isRejectedForFraud;
  }

  adjustForAccessibility(isAdjustmentNeeded) {
    this._isAdjustedForAccessibility = !!isAdjustmentNeeded;
  }

  isAdjustementNeeded() {
    return this._isAdjustedForAccessibility;
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

  correctFirstName(modifiedFirstName) {
    const sanitizedString = _sanitizedString(modifiedFirstName);
    if (isEmpty(sanitizedString)) {
      throw new EntityValidationError({
        invalidAttributes: [{ attribute: 'firstName', message: "Candidate's first name must not be blank or empty" }],
      });
    }
    this._firstName = sanitizedString;
  }

  correctLastName(modifiedLastName) {
    const sanitizedString = _sanitizedString(modifiedLastName);
    if (isEmpty(sanitizedString)) {
      throw new EntityValidationError({
        invalidAttributes: [{ attribute: 'lastName', message: "Candidate's last name must not be blank or empty" }],
      });
    }
    this._lastName = sanitizedString;
  }

  correctBirthplace(modifiedBirthplace) {
    const sanitizedString = _sanitizedString(modifiedBirthplace);
    if (!isEmpty(sanitizedString?.trim())) {
      this._birthplace = sanitizedString;
    }
  }

  correctSex(modifiedSex) {
    const sanitizedString = _sanitizedString(modifiedSex);
    if (!isEmpty(sanitizedString) && !['M', 'F'].includes(sanitizedString)) {
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

  getUserId() {
    return this._userId;
  }

  getCreatedAt() {
    return this._createdAt;
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

  getStartDate() {
    return this._createdAt;
  }

  getNumberOfChallenges() {
    return this._numberOfChallenges ?? this._challenges?.length ?? 0;
  }

  setNumberOfChallenges(numberOfChallenges) {
    this._numberOfChallenges = numberOfChallenges;
  }

  /**
   * @returns {Assessment}
   */
  getAssessment() {
    return this._assessment;
  }

  isV2() {
    return AlgorithmEngineVersion.isV2(this._version);
  }

  isV3() {
    return AlgorithmEngineVersion.isV3(this._version);
  }

  static isLanguageAvailableForV3Certification(candidateLanguage) {
    if (!candidateLanguage) return false;

    return V3_CERTIFICATION_AVAILABLE_LOCALES.includes(candidateLanguage);
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
      createdAt: this._createdAt,
      isPublished: this._isPublished,
      isRejectedForFraud: this._isRejectedForFraud,
      isAdjustedForAccessibility: this._isAdjustedForAccessibility,
      verificationCode: this._verificationCode,
      assessment: this._assessment,
      challenges: this._challenges,
      certificationIssueReports: this._certificationIssueReports, // TODO : this.certificationIssueReports.toDTO()
      userId: this._userId,
      sessionId: this._sessionId,
      maxReachableLevelOnCertificationDate: this._maxReachableLevelOnCertificationDate,
      abortReason: this._abortReason,
      complementaryCertificationCourse: this._complementaryCertificationCourse,
      numberOfChallenges: this._numberOfChallenges,
      version: this._version,
      lang: this._lang,
      candidateId: this.candidateId,
      versionId: this.versionId,
      framework: this.framework,
      lastAnswerAt: this.lastAnswerAt,
    };
  }
}

function _sanitizedString(string) {
  const trimmedString = string?.trim();
  const multipleWhiteSpacesInARow = / +/g;
  const withUnifiedWithSpaces = trimmedString?.replace(multipleWhiteSpacesInARow, ' ');

  return withUnifiedWithSpaces;
}
