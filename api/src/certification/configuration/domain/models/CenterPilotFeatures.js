/**
 * @typedef {import ('../../../shared/domain/constants.js').CERTIFICATION_FEATURES} CERTIFICATION_FEATURES
 */

export class CenterPilotFeatures {
  centerId;
  // @see CERTIFICATION_FEATURES
  isComplementaryAlonePilot;

  /**
   * @param {Object} params
   * @param {number} params.centerId - reference to the center containing those features
   * @param {boolean} [params.isComplementaryAlonePilot]
   */
  constructor({ centerId, isComplementaryAlonePilot = false }) {
    this.centerId = centerId;
    this.isComplementaryAlonePilot = !!isComplementaryAlonePilot;
  }

  enableComplementaryAlonePilot() {
    this.isComplementaryAlonePilot = true;
    return this;
  }
}
