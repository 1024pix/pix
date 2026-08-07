import { SessionEnrolment } from '../../../../../../src/certification/enrolment/domain/models/SessionEnrolment.js';

/**
 * @typedef {import('../../../../../../src/certification/shared/domain/models/Scopes.js').SCOPES} SCOPES
 * @typedef {import('./build-candidate.js').candidateBuilder} CandidateBuilder
 * @typedef {import('../../../../../../db/database-builder/database-builder.js').databaseBuilder} DatabaseBuilder
 */

/**
 * Fluent builder for the {@link SessionEnrolment} domain read-model.
 *
 * @example
 * const sessionEnrolment = domainBuilder.certification.enrolment
 *   .sessionEnrolmentBuilder()
 *   .withParameters({ address: '2 rue des églantines' })
 *   .insertToDB({ databaseBuilder });
 */
class SessionEnrolmentBuilder {
  constructor() {
    this.id = undefined;
    this.date = '2024-01-01';
    this.time = '14:00:00';
    this.examiner = 'Moi';
    this.room = 'A4';
    this.accessCode = 'ABC123';
    this.address = '3 rue des Pruneaux';
    this.description = 'La session va se passer en extérieur';
    this.invigilatorPassword = 'DEF456';
    this.createdById = null;
    this.certificationCenterId = null;
    this.certificationCenterName = 'SuperCentre';
    this.certificationCenterType = 'PRO';
    this.finalizedAt = null;
    this.candidatesBuilders = [];
  }

  /**
   * Overrides any subset of the SessionEnrolmentBuilder attributes carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   *
   * @param {object} [params]
   * @param {number} [params.userId] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted user (id null)
   * @param {number} [params.certificationCenterId] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted certification center (id null)
   * @param {string} [params.certificationCenterName]
   * @param {string} [params.certificationCenterType]
   * @returns {SessionEnrolmentBuilder}
   */
  createdBy({
    userId = null,
    certificationCenterId = null,
    certificationCenterName = 'SuperCentre',
    certificationCenterType = 'PRO',
  }) {
    this.createdById = userId;
    this.certificationCenterId = certificationCenterId;
    this.certificationCenterName = certificationCenterName;
    this.certificationCenterType = certificationCenterType;
    return this;
  }

  /**
   * Set the session as finalized
   *
   * @param {object} [params]
   * @param {Date} [params.at]
   * @returns {SessionEnrolmentBuilder}
   */
  finalized({ at = new Date() } = {}) {
    this.finalizedAt = at;
    return this;
  }

  /**
   * Overrides any subset of the SessionEnrolmentBuilder attributes carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   *
   * @param {object} [params]
   * @param {number} [params.id] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted session (id null)
   * @param {string} [params.date]
   * @param {string} [params.time]
   * @param {string} [params.examiner]
   * @param {string} [params.room]
   * @param {string} [params.accessCode]
   * @param {string} [params.address]
   * @param {string} [params.description]
   * @param {string} [params.invigilatorPassword]
   * @returns {SessionEnrolmentBuilder}
   */
  withParameters({ id, date, time, examiner, room, accessCode, address, description, invigilatorPassword } = {}) {
    this.id = id ?? this.id;
    this.date = date ?? this.date;
    this.time = time ?? this.time;
    this.examiner = examiner ?? this.examiner;
    this.room = room ?? this.room;
    this.accessCode = accessCode ?? this.accessCode;
    this.address = address ?? this.address;
    this.description = description ?? this.description;
    this.invigilatorPassword = invigilatorPassword ?? this.invigilatorPassword;
    return this;
  }

  /**
   * Add candidate builders to build in cascade candidates linked to this session
   *
   * @param {CandidateBuilder[]} candidatesBuilders
   * @returns {SessionEnrolmentBuilder}
   */
  addCandidatesBuilders(candidatesBuilders) {
    this.candidatesBuilders.push(...candidatesBuilders);
    return this;
  }

  /**
   * Inserts corresponding sessions row and all the underlying necessary data
   * then returns the built domain SessionEnrolment carrying the persisted id.
   * Must be called before `await databaseBuilder.commit()`.
   *
   * @param {object} params
   * @param {DatabaseBuilder} params.databaseBuilder
   * @returns {SessionEnrolment} the persisted sessionEnrolment
   */
  insertToDB({ databaseBuilder }) {
    const sessionEnrolment = this.build();

    const createdById = databaseBuilder.factory.buildUser({
      id: sessionEnrolment.createdBy ?? undefined,
    }).id;
    sessionEnrolment.createdBy = createdById;

    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
      id: sessionEnrolment.certificationCenterId ?? undefined,
      name: sessionEnrolment.certificationCenter,
      type: sessionEnrolment.certificationCenterType,
    }).id;
    sessionEnrolment.certificationCenterId = certificationCenterId;
    databaseBuilder.factory.buildCertificationCenterMembership({
      userId: sessionEnrolment.createdBy,
      certificationCenterId: sessionEnrolment.certificationCenterId,
    });

    const sessionId = databaseBuilder.factory.buildSession({
      id: sessionEnrolment.id ?? undefined,
      date: sessionEnrolment.date,
      time: sessionEnrolment.time,
      examiner: sessionEnrolment.examiner,
      room: sessionEnrolment.room,
      accessCode: sessionEnrolment.accessCode,
      address: sessionEnrolment.address,
      description: sessionEnrolment.description,
      invigilatorPassword: sessionEnrolment.invigilatorPassword,
      version: sessionEnrolment.version,
      certificationCenterId: sessionEnrolment.certificationCenterId,
      certificationCenter: sessionEnrolment.certificationCenter,
      createdBy: sessionEnrolment.createdBy,
      finalizedAt: sessionEnrolment.finalizedAt,
    }).id;

    sessionEnrolment.id = sessionId;
    this.id = sessionId;
    sessionEnrolment.certificationCandidates = this.candidatesBuilders.map((candidateBuilder) => {
      candidateBuilder.withParameters({ sessionId: this.id });
      return candidateBuilder.insertToDB({ databaseBuilder });
    });

    return sessionEnrolment;
  }

  /**
   * Materializes the model SessionEnrolment without touching the database.
   *
   * @returns {SessionEnrolment}
   */
  build() {
    const certificationCandidates = this.candidatesBuilders.map((candidateBuilder) => {
      candidateBuilder.withParameters({ sessionId: this.id });
      return candidateBuilder.build();
    });
    return new SessionEnrolment({
      id: this.id,
      date: this.date,
      time: this.time,
      address: this.address,
      room: this.room,
      examiner: this.examiner,
      accessCode: this.accessCode,
      description: this.description,
      invigilatorPassword: this.invigilatorPassword,
      createdBy: this.createdById,
      finalizedAt: this.finalizedAt,
      certificationCenterId: this.certificationCenterId,
      certificationCenter: this.certificationCenterName,
      certificationCenterType: this.certificationCenterType,
      certificationCandidates,
      version: 3,
    });
  }
}

/**
 * Entry point of the fluent SessionEnrolment builder. Returns the builder, NOT a SessionEnrolment:
 * Note: end the chain with build() for in-memory storage or insertToDB() for DB storage.
 *
 * @returns {SessionEnrolmentBuilder}
 */
export function sessionEnrolmentBuilder() {
  return new SessionEnrolmentBuilder();
}
