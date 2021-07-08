const _ = require('lodash');
const Joi = require('joi').extend(require('@joi/date'));
const { EntityValidationError } = require('../errors');

class CertificationCourse {
  constructor(
    {
      id,
      firstName,
      lastName,
      birthdate,
      birthplace,
      birthPostalCode,
      birthINSEECode,
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
    } = {}) {
    this._id = id;
    this._firstName = firstName;
    this._lastName = lastName;
    this._birthdate = birthdate;
    this._birthplace = birthplace;
    this._birthPostalCode = birthPostalCode;
    this._birthINSEECode = birthINSEECode;
    this._sex = sex;
    this._externalId = externalId;
    this._hasSeenEndTestScreen = hasSeenEndTestScreen;
    this._createdAt = createdAt;
    this._completedAt = completedAt;
    this._isPublished = isPublished;
    this.isV2Certification = isV2Certification;
    this.verificationCode = verificationCode;
    this.assessment = assessment;
    this.challenges = challenges;
    this.certificationIssueReports = certificationIssueReports;
    this.userId = userId;
    this.sessionId = sessionId;
    this.maxReachableLevelOnCertificationDate = maxReachableLevelOnCertificationDate;
    this._isCancelled = isCancelled;
  }

  reportIssue(issueReport) {
    this.certificationIssueReports.push(issueReport);
  }

  static from({ certificationCandidate, challenges, verificationCode, maxReachableLevelOnCertificationDate }) {
    return new CertificationCourse({
      userId: certificationCandidate.userId,
      sessionId: certificationCandidate.sessionId,
      firstName: certificationCandidate.firstName,
      lastName: certificationCandidate.lastName,
      birthdate: certificationCandidate.birthdate,
      birthPostalCode: certificationCandidate.birthPostalCode,
      birthINSEECode: certificationCandidate.birthINSEECode,
      sex: certificationCandidate.sex,
      birthplace: certificationCandidate.birthCity,
      externalId: certificationCandidate.externalId,
      isV2Certification: true,
      challenges,
      verificationCode,
      maxReachableLevelOnCertificationDate,
    });
  }

  cancel() {
    this._isCancelled = true;
  }

  modifyFirstName(modifiedFirstName) {
    const sanitizedString = _sanitizedString(modifiedFirstName);
    if (_.isEmpty(sanitizedString)) {
      throw new EntityValidationError({
        invalidAttributes: [{ attribute: 'firstName', message: 'Candidate\'s first name must not be blank or empty' }],
      });
    }
    this._firstName = sanitizedString;
  }

  modifyLastName(modifiedLastName) {
    const sanitizedString = _sanitizedString(modifiedLastName);
    if (_.isEmpty(sanitizedString)) {
      throw new EntityValidationError({
        invalidAttributes: [{ attribute: 'lastName', message: 'Candidate\'s last name must not be blank or empty' }],
      });
    }
    this._lastName = sanitizedString;
  }

  modifyBirthplace(modifiedBirthplace) {
    const sanitizedString = _sanitizedString(modifiedBirthplace);
    if (_.isEmpty(sanitizedString?.trim())) {
      throw new EntityValidationError({
        invalidAttributes: [{ attribute: 'birthplace', message: 'Candidate\'s birthplace must not be blank or empty' }],
      });
    }
    this._birthplace = sanitizedString;
  }

  modifyBirthdate(modifiedBirthdate) {
    const { error } = Joi.date()
      .format('YYYY-MM-DD')
      .greater('1900-01-01')
      .required()
      .empty(null)
      .validate(modifiedBirthdate);
    if (error) {
      throw new EntityValidationError({
        invalidAttributes: [{ attribute: 'birthdate', message: 'Candidate\'s birthdate must be a valid date' }],
      });
    }
    this._birthdate = modifiedBirthdate;
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
      sex: this._sex,
      externalId: this._externalId,
      hasSeenEndTestScreen: this._hasSeenEndTestScreen,
      createdAt: this._createdAt,
      completedAt: this._completedAt,
      isPublished: this._isPublished,
      isV2Certification: this.isV2Certification,
      verificationCode: this.verificationCode,
      assessment: this.assessment,
      challenges: this.challenges,
      certificationIssueReports: this.certificationIssueReports, // TODO : this.certificationIssueReports.toDTO()
      userId: this.userId,
      sessionId: this.sessionId,
      maxReachableLevelOnCertificationDate: this.maxReachableLevelOnCertificationDate,
      isCancelled: this._isCancelled,
    };
  }

  getId() {
    return this._id;
  }

  isPublished() {
    return this._isPublished;
  }
}

function _sanitizedString(string) {
  const trimmedString = string?.trim();
  const multipleWhiteSpacesInARow = / +/g;
  const withUnifiedWithSpaces = trimmedString?.replace(multipleWhiteSpacesInARow, ' ');

  return withUnifiedWithSpaces;
}

module.exports = CertificationCourse;
