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
  constructor({ id, startedAt, status, scope, calibratedChallenges }) {
    this.id = id;
    this.startedAt = startedAt;
    this.status = status;
    this.scope = scope;
    this.calibratedChallenges = calibratedChallenges;
  }
}

export class CalibratedChallenge {
  constructor({ id, challengeId, tubeId, alpha, delta }) {
    this.id = id;
    this.challengeId = challengeId;
    this.tubeId = tubeId;
    this.alpha = alpha;
    this.delta = delta;
  }
}
