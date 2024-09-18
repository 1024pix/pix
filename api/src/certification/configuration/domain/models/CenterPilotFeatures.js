/**
 * @typedef {import ('../../../shared/domain/constants.js').CERTIFICATION_FEATURES} CERTIFICATION_FEATURES
 */
import { CertificationCenterPilotFeaturesConflictError } from '../../../../shared/domain/errors.js';

export class CenterPilotFeatures {
  centerId;
  // @see CERTIFICATION_FEATURES
  isComplementaryAlonePilot;
  isV3Pilot;

  /**
   * @param {Object} params
   * @param {number} params.centerId - reference to the center containing those features
   * @param {boolean} [params.isV3Pilot]
   * @param {boolean} [params.isComplementaryAlonePilot]
   */
  constructor({ centerId, isV3Pilot = false, isComplementaryAlonePilot = false }) {
    this.centerId = centerId;
    this.isV3Pilot = !!isV3Pilot;
    this.isComplementaryAlonePilot = !!isComplementaryAlonePilot;
  }

  enableComplementaryAlonePilot() {
    if (!this.isV3Pilot) {
      throw new CertificationCenterPilotFeaturesConflictError();
    }

    this.isComplementaryAlonePilot = true;
    return this;
  }

  enableV3Pilot() {
    this.isV3Pilot = true;
    return this;
  }

  disableV3Pilot() {
    if (this.isComplementaryAlonePilot) {
      throw new CertificationCenterPilotFeaturesConflictError();
    }
    this.isV3Pilot = false;
    return this;
  }
}
