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

export class Calibration {
  /**
   * @param {object} params
   * @param {Array<CalibrationScoringMesh>} [params.scoringMeshes]
   */
  constructor({ id, startedAt, status, scope, calibratedChallenges, scoringMeshes = [] }) {
    this.id = id;
    this.startedAt = startedAt;
    this.status = status;
    this.scope = scope;
    this.calibratedChallenges = calibratedChallenges;
    this.scoringMeshes = scoringMeshes;
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

export class CalibrationScoringMesh {
  constructor({ mesh, minBoundCuratedValue, maxBoundCuratedValue }) {
    this.mesh = mesh;
    this.minBoundCuratedValue = minBoundCuratedValue;
    this.maxBoundCuratedValue = maxBoundCuratedValue;
  }
}

const CALIBRATION_SCOPE_BY_SCOPE = Object.freeze({
  [SCOPES.CORE]: CALIBRATION_SCOPES.COEUR,
  [SCOPES.PIX_PLUS_EDU_1ER_DEGRE]: CALIBRATION_SCOPES.EDU_1ER_DEGRE,
  [SCOPES.PIX_PLUS_EDU_2ND_DEGRE]: CALIBRATION_SCOPES.EDU_2ND_DEGRE,
  [SCOPES.PIX_PLUS_EDU_CPE]: CALIBRATION_SCOPES.EDU_CPE,
  [SCOPES.PIX_PLUS_DROIT]: CALIBRATION_SCOPES.DROIT,
  [SCOPES.PIX_PLUS_PRO_SANTE]: CALIBRATION_SCOPES.PRO_SANTE,
});

const SCOPE_BY_CALIBRATION_SCOPE = Object.freeze(
  Object.fromEntries(
    Object.entries(CALIBRATION_SCOPE_BY_SCOPE).map(([scope, calibrationScope]) => [calibrationScope, scope]),
  ),
);

/**
 * @param {typeof CALIBRATION_SCOPES[keyof typeof CALIBRATION_SCOPES]} calibrationScope
 * @returns {SCOPES}
 */
export function fromCalibrationScope(calibrationScope) {
  return SCOPE_BY_CALIBRATION_SCOPE[calibrationScope];
}

/**
 * @param {SCOPES} scope
 * @returns {typeof CALIBRATION_SCOPES[keyof typeof CALIBRATION_SCOPES]}
 */
export function toCalibrationScope(scope) {
  return CALIBRATION_SCOPE_BY_SCOPE[scope];
}
