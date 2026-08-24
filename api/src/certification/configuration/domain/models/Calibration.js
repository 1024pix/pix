import { SCOPES } from '../../../shared/domain/models/Scopes.js';

export const CALIBRATION_STATUSES = Object.freeze({
  TO_VALIDATE: 'TO_VALIDATE',
  VALIDATED: 'VALIDATED',
  INVALIDATED: 'INVALIDATED',
});

export const CALIBRATION_SCOPES = Object.freeze({
  COEUR: 'COEUR',
  EDU_2ND_DEGRE: 'EDU_2ND_DEGRE',
  EDU_1ER_DEGRE: 'EDU_1ER_DEGRE',
  EDU_CPE: 'EDU_CPE',
  DROIT: 'DROIT',
  PRO_SANTE: 'PRO_SANTE',
});

export const SCORING_MESH_AVAILABILITIES = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  PENDING: 'PENDING',
  NOT_VALIDATED: 'NOT_VALIDATED',
});

export class Calibration {
  /**
   * @param {object} params
   * @param {CalibrationScoringMeshSet} [params.scoringMeshSet] - defaults to an empty, thus pending, set
   */
  constructor({
    id,
    startedAt,
    status,
    scope,
    calibratedChallenges,
    scoringMeshSet = new CalibrationScoringMeshSet(),
  }) {
    this.id = id;
    this.startedAt = startedAt;
    this.status = status;
    this.scope = scope;
    this.calibratedChallenges = calibratedChallenges;
    this.scoringMeshSet = scoringMeshSet;
  }

  get challengeCount() {
    return this.calibratedChallenges.length;
  }

  /**
   *
   * @returns {Set<string>} tubeIds
   */
  get tubeIds() {
    const tubeIds = new Set();
    for (const calibratedChallenge of this.calibratedChallenges) {
      tubeIds.add(calibratedChallenge.tubeId);
    }

    return tubeIds;
  }
}

export class CalibrationForReport {
  constructor({ id, startedAt, status, scope, challengeCount, tubeIds, hasMeshScoring, hasCompetenceScoring }) {
    this.id = id;
    this.startedAt = startedAt;
    this.status = status;
    this.scope = scope;
    this.challengeCount = challengeCount;
    this.tubeIds = tubeIds;
    this.hasMeshScoring = hasMeshScoring;
    this.hasCompetenceScoring = hasCompetenceScoring;
  }
}

export class CalibratedChallenge {
  constructor({ challengeId, tubeId, alpha, delta }) {
    this.challengeId = challengeId;
    this.tubeId = tubeId;
    this.alpha = alpha;
    this.delta = delta;
  }
}

/**
 * One mesh of a scoring mesh set, as curated by Data. Bounds are expressed in capacity.
 */
export class CalibrationScoringMesh {
  constructor({ mesh, minBoundCuratedValue, maxBoundCuratedValue }) {
    this.mesh = mesh;
    this.minBoundCuratedValue = minBoundCuratedValue;
    this.maxBoundCuratedValue = maxBoundCuratedValue;
  }
}

/**
 * The scoring mesh set attached to a calibration.
 *
 * Data delivers it asynchronously, after the calibration itself, and does not deliver it at all for
 * some scopes: an empty set is a nominal state, not an error.
 */
export class CalibrationScoringMeshSet {
  /**
   * @param {object} [params]
   * @param {typeof CALIBRATION_STATUSES[keyof typeof CALIBRATION_STATUSES]|null} [params.status] - null when Data has not delivered any set yet
   * @param {Array<CalibrationScoringMesh>} [params.meshes]
   */
  constructor({ status = null, meshes = [] } = {}) {
    this.status = status;
    this.meshes = meshes;
  }

  /**
   * @returns {typeof SCORING_MESH_AVAILABILITIES[keyof typeof SCORING_MESH_AVAILABILITIES]}
   */
  get availability() {
    if (this.status === null || this.meshes.length === 0) {
      return SCORING_MESH_AVAILABILITIES.PENDING;
    }
    if (this.status !== CALIBRATION_STATUSES.VALIDATED) {
      return SCORING_MESH_AVAILABILITIES.NOT_VALIDATED;
    }
    return SCORING_MESH_AVAILABILITIES.AVAILABLE;
  }

  get isAvailable() {
    return this.availability === SCORING_MESH_AVAILABILITIES.AVAILABLE;
  }
}

/**
 * @param {typeof CALIBRATION_SCOPES[keyof typeof CALIBRATION_SCOPES]} calibrationScope
 * @returns {SCOPES}
 */
export function fromCalibrationScope(calibrationScope) {
  const mapping = {
    [CALIBRATION_SCOPES.COEUR]: SCOPES.CORE,
    [CALIBRATION_SCOPES.EDU_1ER_DEGRE]: SCOPES.PIX_PLUS_EDU_1ER_DEGRE,
    [CALIBRATION_SCOPES.EDU_2ND_DEGRE]: SCOPES.PIX_PLUS_EDU_2ND_DEGRE,
    [CALIBRATION_SCOPES.EDU_CPE]: SCOPES.PIX_PLUS_EDU_CPE,
    [CALIBRATION_SCOPES.DROIT]: SCOPES.PIX_PLUS_DROIT,
    [CALIBRATION_SCOPES.PRO_SANTE]: SCOPES.PIX_PLUS_PRO_SANTE,
  };
  return mapping[calibrationScope];
}
