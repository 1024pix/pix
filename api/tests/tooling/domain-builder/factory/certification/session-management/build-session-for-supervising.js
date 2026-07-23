import dayjs from 'dayjs';

import { VERSION_STATUSES } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import { SessionForSupervising } from '../../../../../../src/certification/session-management/domain/read-models/SessionForSupervising.js';
import { Frameworks, toScope } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';

/**
 * @typedef {import('../../../../../../src/certification/shared/domain/models/Scopes.js').SCOPES} SCOPES
 * @typedef {import('../../../../../../db/database-builder/database-builder.js').databaseBuilder} DatabaseBuilder
 */

/**
 * Fluent builder for the {@link SessionForSupervising} domain read-model.
 *
 * @example
 * const sessionForSupervising = domainBuilder.certification.sessionManagement
 *   .sessionForSupervisingBuilder()
 *   .withCandidate({ id: 123, firstName: 'Robert' })
 *   .withParameters({ address: '2 rue des églantines' })
 *   .insertToDB({ databaseBuilder });
 */
class SessionForSupervisingBuilder {
  constructor() {
    this.id = null;
    this.date = '2024-01-01';
    this.time = '14:00:00';
    this.examiner = 'Moi';
    this.room = 'A4';
    this.accessCode = 'ABC123';
    this.candidates = [];
    this.address = '3 rue des Pruneaux';
  }

  /**
   * Adds a candidte
   *
   * @param {object} params
   * @param {number} params.id - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted certification-candidates (id null)
   * @param {number} params.userId
   * @param {date} params.birthdate
   * @param {string} params.firstName
   * @param {string} params.lastName
   * @param {number} params.extraTimePercentage
   * @param {boolean} params.authorizedToStart
   * @param {string} params.assessmentStatus
   * @param {date} params.startDateTime
   * @param {date} params.theoricalEndDateTime
   * @param {string} params.subscription
   * @param {boolean} params.isStillEligibleToDoubleCertification
   * @param {LiveAlert} params.challengeLiveAlert
   * @param {LiveAlert} params.companionLiveAlert
   * @returns {SessionForSupervisingBuilder}
   */
  addCandidate({
    id,
    userId,
    birthdate,
    firstName,
    lastName,
    extraTimePercentage,
    authorizedToStart,
    assessmentStatus,
    startDateTime,
    theoricalEndDateTime,
    subscription,
    isStillEligibleToDoubleCertification,
    challengeLiveAlert,
    companionLiveAlert,
  }) {
    this.candidates.push({
      id: id ?? null,
      userId: userId ?? 123,
      birthdate: birthdate ?? '2000-01-01',
      firstName: firstName ?? 'Lolo',
      lastName: lastName ?? 'Lapraline',
      extraTimePercentage: extraTimePercentage ?? 2,
      authorizedToStart: authorizedToStart,
      assessmentStatus: assessmentStatus ?? 'started',
      startDateTime: startDateTime ?? new Date('2026-06-06T12:00:00Z'),
      theoricalEndDateTime: theoricalEndDateTime ?? new Date('2026-06-06T12:30:00Z'),
      subscription: subscription ?? Frameworks.CORE,
      isStillEligibleToDoubleCertification: isStillEligibleToDoubleCertification,
      challengeLiveAlert: challengeLiveAlert ?? null,
      companionLiveAlert: companionLiveAlert ?? null,
    });
    return this;
  }

  /**
   * Overrides any subset of the SessionForSupervisingBuilder attributes carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   * Does not allow to set the candidates
   *
   * @param {object} [params]
   * @param {number} [params.id] - explicit id; without it, insertToDB lets the database assign one and build() produces a non-persisted session (id null)
   * @param {string} [params.date]
   * @param {string} [params.time]
   * @param {string} [params.examiner]
   * @param {string} [params.room]
   * @param {string} [params.accessCode]
   * @param {string} [params.address]
   * @returns {SessionForSupervisingBuilder}
   */
  withParameters({ id, date, time, examiner, room, accessCode, address } = {}) {
    this.id = id ?? this.id;
    this.date = date ?? this.date;
    this.time = time ?? this.time;
    this.examiner = examiner ?? this.examiner;
    this.room = room ?? this.room;
    this.accessCode = accessCode ?? this.accessCode;
    this.address = address ?? this.address;
    return this;
  }

  /**
   * Inserts corresponding sessions row and all the underlying necessary data
   * then returns the built domain SessionForSupervising carrying the persisted id.
   * Must be called before `await databaseBuilder.commit()`.
   *
   * @param {object} params
   * @param {DatabaseBuilder} params.databaseBuilder
   * @returns {SessionForSupervising} the persisted sessionForSupervising
   */
  insertToDB({ databaseBuilder }) {
    const sessionForSupervising = this.build();

    const row = databaseBuilder.factory.buildSession({
      id: sessionForSupervising.id ?? undefined,
      date: sessionForSupervising.date ?? undefined,
      time: sessionForSupervising.time ?? undefined,
      examiner: sessionForSupervising.examiner ?? undefined,
      room: sessionForSupervising.room ?? undefined,
      accessCode: sessionForSupervising.accessCode ?? undefined,
      address: sessionForSupervising.address ?? undefined,
    });

    const versions = new Map();
    for (const candidate of sessionForSupervising.candidates) {
      const candidateScope = toScope(candidate.subscription);
      let versionId = versions.get(candidateScope);
      if (!versionId) {
        versionId = databaseBuilder.factory.buildCertificationVersion({
          scope: candidateScope,
          assessmentDuration: computeAssessmentDuration(candidate.startDateTime, candidate.theoricalEndDateTime),
          minimumAnswersRequiredToValidateACertification: 1,
          globalScoringConfiguration: [],
          competencesScoringConfiguration: [],
          challengesConfiguration: null,
          status: VERSION_STATUSES.ACTIVE,
        }).id;

        databaseBuilder.factory.buildCertificationVersionTube({
          tubeId: 'tubeA',
          versionId,
        });

        versions.set(candidateScope, versionId);
      }
      candidate.userId = databaseBuilder.factory.buildUser({ id: candidate.userId ?? undefined }).id;
      candidate.id = databaseBuilder.factory.buildCertificationCandidate({
        id: candidate.id ?? undefined,
        sessionId: row.id,
        userId: candidate.userId,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        birthdate: candidate.birthdate,
        extraTimePercentage: candidate.extraTimePercentage,
        authorizedToStartAt: candidate.authorizedToStart ? new Date() : null,
        subscription: candidate.subscription,
      }).id;

      let assessmentId;
      if (candidate.startDateTime) {
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          candidateId: candidate.id,
          createdAt: candidate.startDateTime,
          versionId,
        }).id;
        assessmentId = databaseBuilder.factory.buildAssessment({
          state: candidate.assessmentStatus,
          certificationCourseId,
        }).id;
      }

      if (candidate.challengeLiveAlert && assessmentId) {
        databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId,
          challengeId: 'foo',
          status: candidate.challengeLiveAlert.status,
          hasEmbed: candidate.challengeLiveAlert.hasEmbed,
          isFocus: candidate.challengeLiveAlert.isFocus,
          hasImage: candidate.challengeLiveAlert.hasImage,
          hasAttachment: candidate.challengeLiveAlert.hasAttachment,
        });
      }

      if (candidate.companionLiveAlert && assessmentId) {
        databaseBuilder.factory.buildCertificationCompanionLiveAlert({
          assessmentId,
          status: candidate.companionLiveAlert.status,
        });
      }
    }

    this.id = row.id;
    return this.build();
  }

  /**
   * Materializes the read-model SessionForSupervising without touching the database.
   *
   * @returns {SessionForSupervising}
   */
  build() {
    return new SessionForSupervising({
      id: this.id,
      date: this.date,
      time: this.time,
      address: this.address,
      room: this.room,
      examiner: this.examiner,
      accessCode: this.accessCode,
      candidates: this.candidates,
    });
  }
}

/**
 * Entry point of the fluent SessionForSupervising builder. Returns the builder, NOT a SessionForSupervising:
 * Note: end the chain with build() for in-memory storage or insertToDB() for DB storage.
 *
 * @returns {SessionForSupervisingBuilder}
 */
export function sessionForSupervisingBuilder() {
  return new SessionForSupervisingBuilder();
}

function computeAssessmentDuration(startDateTime, theoreticalEndTime) {
  const start = dayjs(startDateTime);
  const end = dayjs(theoreticalEndTime);

  if (!start.isValid() || !end.isValid()) {
    return null;
  }

  return end.diff(start, 'minute');
}
