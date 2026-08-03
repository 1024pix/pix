import {
  CalibratedChallenge,
  Calibration,
  CALIBRATION_SCOPES,
  CALIBRATION_STATUSES,
} from '../../../../../../src/certification/configuration/domain/models/Calibration.js';
import { datawarehouseKnex } from '../../../../databases.js';

/**
 * @typedef {Object} CalibratedChallengeData
 * @property {number} id
 * @property {number} alpha
 * @property {number} delta
 * @property {string} challengeId
 * @property {string} tubeId
 * @property {boolean} isExcluded
 */

/**
 * Fluent builder for the {@link Calibration} domain model.
 *
 * @example
 * const calibration = domainBuilder.certification.configuration
 *   .calibrationBuilder()
 *   .onScope(SCOPES.PIX_PLUS_DROIT)
 *   .asValidated()
 *   .withCalibratedChallenges([{ id: 1, challengeId: 'chalABC', alpha: -4, delta: 3.324, isExcluded: false }])
 *   .withParameters({ id: 123 })
 *   .insertToDB({ databaseBuilder });
 */
class CalibrationBuilder {
  constructor() {
    this.id = 1;
    this.startedAt = new Date('2000-01-01');
    this.status = CALIBRATION_STATUSES.VALIDATED;
    this.scope = CALIBRATION_SCOPES.COEUR;
    this.calibratedChallengesData = [];
  }

  /**
   * Marks calibration as validated.
   *
   * @param {object} params
   * @param {Date} [params.startedAt]
   * @returns {CalibrationBuilder}
   */
  asValidated({ startedAt = new Date() } = {}) {
    this.status = CALIBRATION_STATUSES.VALIDATED;
    this.startedAt = startedAt;
    return this;
  }

  /**
   * Marks calibration as invalidated.
   *
   * @param {object} params
   * @param {Date} [params.startedAt]
   * @returns {CalibrationBuilder}
   */
  asInvalidated({ startedAt = new Date() } = {}) {
    this.status = CALIBRATION_STATUSES.INVALIDATED;
    this.startedAt = startedAt;
    return this;
  }

  /**
   * Marks calibration as to validate.
   *
   * @param {object} params
   * @param {Date} [params.startedAt]
   * @returns {CalibrationBuilder}
   */
  asToValidate({ startedAt = new Date() } = {}) {
    this.status = CALIBRATION_STATUSES.TO_VALIDATE;
    this.startedAt = startedAt;
    return this;
  }

  /**
   * Set calibration on scope
   *
   * @param {object} [params]
   * @param {typeof CALIBRATION_SCOPES[keyof typeof CALIBRATION_SCOPES]} params.scope
   * @returns {CalibrationBuilder}
   */
  onScope({ scope = CALIBRATION_SCOPES.COEUR } = {}) {
    this.scope = scope;
    return this;
  }

  /**
   * Overrides any subset of the Calibration attributes carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   *
   * @param {CalibratedChallengeData[]} calibratedChallengesData
   * @returns {CalibrationBuilder}
   */
  withCalibratredChallenges(calibratedChallengesData) {
    this.calibratedChallengesData = calibratedChallengesData;
    return this;
  }

  /**
   * Overrides any subset of the Calibration attributes carried by the builder.
   * Omitted parameters keep their current value, so the method can be called
   * several times in the same chain without resetting previous overrides.
   *
   * @param {object} [params]
   * @param {number} [params.id] - explicit id, must be set
   * @returns {CalibrationBuilder}
   */
  withParameters({ id } = {}) {
    this.id = id ?? this.id;
    return this;
  }

  /**
   * Inserts the calibration row and any subsequent data to DATAWAREHOUSE DB
   * then returns the built domain Calibration carrying the persisted id.
   * PERSISTS DATA IMMEDIATELY
   *
   * @returns {Promise<Calibration>} the persisted calibration
   */
  async insertToDB() {
    const calibration = this.build();

    await datawarehouseKnex('data_calibrations').insert({
      id: calibration.id,
      calibration_date: calibration.startedAt,
      scope: calibration.scope,
      status: calibration.status,
    });

    const calibratedChallengesToInsert = this.calibratedChallengesData.map((calibratedChallengeData) => ({
      id: calibratedChallengeData.id,
      calibration_id: calibration.id,
      challenge_id: calibratedChallengeData.challengeId,
      alpha: calibratedChallengeData.alpha,
      delta: calibratedChallengeData.delta,
      is_excluded: calibratedChallengeData.isExcluded,
    }));
    await datawarehouseKnex('data_calibration_challenges').insert(calibratedChallengesToInsert);
    return calibration;
  }

  /**
   * Materializes the domain Calibration without touching the database.
   *
   * @returns {Calibration}
   */
  build() {
    const calibratedChallenges = this.calibratedChallengesData
      .filter((calibratedChallengeData) => !calibratedChallengeData.isExcluded)
      .sort((a, b) => a.id - b.id)
      .map((calibratedChallengeData) => new CalibratedChallenge(calibratedChallengeData));

    return new Calibration({
      id: this.id,
      startedAt: this.startedAt,
      status: this.status,
      scope: this.scope,
      calibratedChallenges,
    });
  }
}

/**
 * Entry point of the fluent Calibration builder. Returns the builder, NOT a Calibration:
 * Note: end the chain with build() for in-memory storage or insertToDB() for DB storage.
 *
 * @returns {CalibrationBuilder}
 */
export function calibrationBuilder() {
  return new CalibrationBuilder();
}
