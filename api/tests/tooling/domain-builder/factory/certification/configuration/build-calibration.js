import {
  CalibratedChallenge,
  Calibration,
  CALIBRATION_SCOPES,
  CALIBRATION_STATUSES,
  CalibrationScoringMesh,
  CalibrationScoringMeshSet,
} from '../../../../../../src/certification/configuration/domain/models/Calibration.js';

/**
 * @typedef {Object} CalibratedChallengeData
 * @property {number} alpha
 * @property {number} delta
 * @property {string} challengeId
 * @property {string} tubeId
 */

/**
 * @typedef {Object} ScoringMeshData
 * @property {number} mesh
 * @property {number} minBoundCuratedValue
 * @property {number} maxBoundCuratedValue
 */

/**
 * Fluent builder for the {@link Calibration} domain model.
 *
 * @example
 * const calibration = domainBuilder.certification.configuration
 *   .calibrationBuilder()
 *   .onScope(SCOPES.PIX_PLUS_DROIT)
 *   .asValidated()
 *   .withCalibratredChallenges([{ challengeId: 'chalABC', tubeId: 'tubeABC', alpha: -4, delta: 3.324 }])
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
    this.scoringMeshesData = null;
    this.scoringMeshesStatus = CALIBRATION_STATUSES.VALIDATED;
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
   * Attaches a scoring mesh set to the calibration. Without this call the calibration carries no set
   * at all, which is the nominal state of a calibration whose meshes Data has not delivered yet.
   *
   * @param {ScoringMeshData[]} scoringMeshesData
   * @param {object} [params]
   * @param {typeof CALIBRATION_STATUSES[keyof typeof CALIBRATION_STATUSES]} [params.status] - status of the SET, independent from the calibration one
   * @returns {CalibrationBuilder}
   */
  withScoringMeshes(scoringMeshesData, { status = CALIBRATION_STATUSES.VALIDATED } = {}) {
    this.scoringMeshesData = scoringMeshesData;
    this.scoringMeshesStatus = status;
    return this;
  }

  /**
   * Buffers the calibration row and any subsequent data into the DATAMART builder
   * then returns the built domain Calibration carrying the persisted id.
   * Call `datamartBuilder.commit()` afterwards to actually persist.
   *
   * Note: `tubeId` is NOT persisted, it is derived by the repository from
   * `challengeId` through the learning content, so `challengeId` must reference
   * a challenge built in the learning content of the test.
   *
   * @returns {Promise<Calibration>} the persisted calibration
   */
  async insertToDB({ datamartBuilder }) {
    const calibration = this.build();

    const persistedCalibration = datamartBuilder.factory.buildCalibration({
      id: calibration.id,
      calibration_date: calibration.startedAt,
      scope: calibration.scope,
      status: calibration.status,
    });

    this.calibratedChallengesData.forEach((calibratedChallengeData) => {
      datamartBuilder.factory.buildDatamartActiveCalibratedChallenge({
        calibrationId: persistedCalibration.id,
        challengeId: calibratedChallengeData.challengeId,
        alpha: calibratedChallengeData.alpha,
        delta: calibratedChallengeData.delta,
      });
    });

    if (this.scoringMeshesData) {
      const persistedScoringMeshesAll = datamartBuilder.factory.buildScoringMeshesAll({
        calibrationId: persistedCalibration.id,
        status: this.scoringMeshesStatus,
      });

      this.scoringMeshesData.forEach((scoringMeshData) => {
        datamartBuilder.factory.buildScoringMesh({
          scoringMeshesAllId: persistedScoringMeshesAll.id,
          mesh: scoringMeshData.mesh,
          minBoundCuratedValue: scoringMeshData.minBoundCuratedValue,
          maxBoundCuratedValue: scoringMeshData.maxBoundCuratedValue,
        });
      });
    }

    return calibration;
  }

  /**
   * Materializes the domain Calibration without touching the database.
   *
   * @returns {Calibration}
   */
  build() {
    const calibratedChallenges = this.calibratedChallengesData.map(
      (calibratedChallengeData) => new CalibratedChallenge(calibratedChallengeData),
    );

    const scoringMeshSet = new CalibrationScoringMeshSet(
      this.scoringMeshesData
        ? {
            status: this.scoringMeshesStatus,
            meshes: this.scoringMeshesData.map((scoringMeshData) => new CalibrationScoringMesh(scoringMeshData)),
          }
        : undefined,
    );

    return new Calibration({
      id: this.id,
      startedAt: this.startedAt,
      status: this.status,
      scope: this.scope,
      calibratedChallenges,
      scoringMeshSet,
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
