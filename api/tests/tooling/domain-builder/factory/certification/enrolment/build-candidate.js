import { Candidate } from '../../../../../../src/certification/enrolment/domain/models/Candidate.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';

/**
 * Entry point of the fluent Candidate builder. Returns the builder, NOT a Candidate:
 * Note: end the chain with build() for in-memory storage or insertToDB() for DB storage.
 *
 * @returns {CandidateBuilder}
 */
export function candidateBuilder() {
  return new CandidateBuilder();
}

class CandidateBuilder {
  constructor() {
    this.firstName = 'Pat';
    this.lastName = 'Atrak';
    this.birthdate = '1990-05-06';
    this.sex = 'F';
    this.accessibilityAdjustmentNeeded = false;
    this.hasSeenCertificationInstructions = false;
    this.doubleCertificationEligibility = false;
    this.userId = null;
    this.doNotPersistUser = false;
    this.resultRecipientEmail = null;
    this.reconciledAt = null;
    this.prepaymentCode = null;
    this.organizationLearnerId = null;
    this.externalId = null;
    this.email = null;
    this.birthProvinceCode = null;
    this.birthPostalCode = null;
    this.birthINSEECode = null;
    this.birthCountry = null;
    this.birthCity = null;
    this.billingMode = null;
    this.subscription = Frameworks.CORE;
    this.sessionId = null;
    this.certificationId = null;
    this.hasStartedTest = false;
  }

  withSubscription(subscription) {
    this.subscription = subscription;
    return this;
  }

  withIdentity({ firstName = 'Colette', lastName = 'Inspiration', birthdate = '2016-10-23' }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    return this;
  }

  asScoCandidate({ organizationLearnerId }) {
    this.organizationLearnerId = organizationLearnerId;
    return this;
  }

  asReconciled({ userId, reconciledAt = new Date(), doNotPersistUser = false } = {}) {
    this.userId = userId;
    this.reconciledAt = reconciledAt;
    this.doNotPersistUser = doNotPersistUser;
    return this;
  }

  withStartedTest({ certificationId = null } = {}) {
    this.certificationId = certificationId;
    this.hasStartedTest = true;
    return this;
  }

  withParameters({
    id,
    sessionId,
    sex,
    birthCity,
    birthCountry,
    birthPostalCode,
    birthINSEECode,
    birthProvinceCode,
    email,
    resultRecipientEmail,
    extraTimePercentage,
    externalId,
    hasSeenCertificationInstructions,
    accessibilityAdjustmentNeeded,
    doubleCertificationEligibility,
    createdAt,
    billingMode,
    prepaymentCode,
  } = {}) {
    this.id = id ?? this.id;
    this.sex = sex ?? this.sex;
    this.birthCity = birthCity ?? this.birthCity;
    this.birthCountry = birthCountry ?? this.birthCountry;
    this.birthPostalCode = birthPostalCode ?? this.birthPostalCode;
    this.birthINSEECode = birthINSEECode ?? this.birthINSEECode;
    this.birthProvinceCode = birthProvinceCode ?? this.birthProvinceCode;
    this.email = email ?? this.email;
    this.resultRecipientEmail = resultRecipientEmail ?? this.resultRecipientEmail;
    this.extraTimePercentage = extraTimePercentage ?? this.extraTimePercentage;
    this.externalId = externalId ?? this.externalId;
    this.sessionId = sessionId ?? this.sessionId;
    this.hasSeenCertificationInstructions =
      hasSeenCertificationInstructions === true
        ? true
        : hasSeenCertificationInstructions === false
          ? false
          : this.hasSeenCertificationInstructions;
    this.accessibilityAdjustmentNeeded =
      accessibilityAdjustmentNeeded === true
        ? true
        : accessibilityAdjustmentNeeded === false
          ? false
          : this.accessibilityAdjustmentNeeded;
    this.doubleCertificationEligibility = doubleCertificationEligibility ?? this.doubleCertificationEligibility;
    this.createdAt = createdAt;
    this.billingMode = billingMode ?? this.billingMode;
    this.prepaymentCode = prepaymentCode ?? this.prepaymentCode;
    return this;
  }

  /**
   * Inserts the candidate row
   * then returns the built domain Candidate carrying the persisted id.
   * Must be called before `await databaseBuilder.commit()`.
   *
   * @param {object} params
   * @param {DatabaseBuilder} params.databaseBuilder
   * @returns {Candidate} the persisted candidate
   */
  insertToDB({ databaseBuilder }) {
    if (!this.sessionId) {
      this.sessionId = databaseBuilder.factory.buildSession().id;
    }

    if (this.reconciledAt && !this.doNotPersistUser) {
      this.userId = databaseBuilder.factory.buildUser({ id: this.userId ?? undefined }).id;
    }

    if (!this.createdAt) {
      this.createdAt = new Date();
    }

    const candidate = this.build();

    const row = databaseBuilder.factory.buildCertificationCandidate({
      id: candidate.id ?? undefined,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      sex: candidate.sex,
      birthdate: candidate.birthdate,
      birthCity: candidate.birthCity,
      birthCountry: candidate.birthCountry,
      birthPostalCode: candidate.birthPostalCode,
      birthINSEECode: candidate.birthINSEECode,
      birthProvinceCode: candidate.birthProvinceCode,
      email: candidate.email,
      resultRecipientEmail: candidate.resultRecipientEmail,
      extraTimePercentage: candidate.extraTimePercentage,
      subscription: candidate.subscription,
      externalId: candidate.externalId,
      sessionId: candidate.sessionId,
      userId: candidate.userId,
      reconciledAt: candidate.reconciledAt,
      organizationLearnerId: candidate.organizationLearnerId,
      hasSeenCertificationInstructions: candidate.hasSeenCertificationInstructions,
      accessibilityAdjustmentNeeded: candidate.accessibilityAdjustmentNeeded,
      billingMode: candidate.billingMode,
      prepaymentCode: candidate.prepaymentCode,
      createdAt: candidate.createdAt,
    });

    if (candidate.hasStartedTest) {
      databaseBuilder.factory.buildCertificationCourse({
        sessionId: this.sessionId,
        id: this.certificationId ?? undefined,
        userId: this.userId ?? undefined,
        candidateId: row.id,
      });
    }

    this.id = row.id;
    this.sessionId = row.sessionId;
    this.userId = row.userId;
    return this.build();
  }

  /**
   * Materializes the domain Candidate without touching the database.
   *
   * @returns {Candidate}
   */
  build() {
    return new Candidate({
      id: this.id ?? undefined,
      firstName: this.firstName,
      lastName: this.lastName,
      sex: this.sex,
      birthdate: this.birthdate,
      birthCity: this.birthCity,
      birthCountry: this.birthCountry,
      birthPostalCode: this.birthPostalCode,
      birthINSEECode: this.birthINSEECode,
      birthProvinceCode: this.birthProvinceCode,
      email: this.email,
      resultRecipientEmail: this.resultRecipientEmail,
      extraTimePercentage: this.extraTimePercentage,
      subscription: this.subscription,
      externalId: this.externalId,
      sessionId: this.sessionId,
      reconciledAt: this.reconciledAt,
      userId: this.userId,
      organizationLearnerId: this.organizationLearnerId,
      hasSeenCertificationInstructions: this.hasSeenCertificationInstructions,
      accessibilityAdjustmentNeeded: this.accessibilityAdjustmentNeeded,
      doubleCertificationEligibility: this.doubleCertificationEligibility,
      createdAt: this.createdAt,
      billingMode: this.billingMode,
      prepaymentCode: this.prepaymentCode,
      hasStartedTest: this.hasStartedTest,
    });
  }
}
