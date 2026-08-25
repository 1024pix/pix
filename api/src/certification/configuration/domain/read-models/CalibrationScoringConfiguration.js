/**
 * @typedef {import('../models/Calibration.js').Calibration} Calibration
 * @typedef {import('../models/Calibration.js').CalibrationScoringMesh} CalibrationScoringMesh
 */

export class CalibrationScoringConfiguration {
  /**
   * @param {object} params
   * @param {number} params.calibrationId
   * @param {Array<{meshLevel: number, bounds: {min: number, max: number}}>} params.globalScoringConfiguration
   */
  constructor({ calibrationId, globalScoringConfiguration }) {
    this.calibrationId = calibrationId;
    this.globalScoringConfiguration = globalScoringConfiguration;
  }

  /**
   * @param {object} params
   * @param {Calibration} params.calibration
   * @returns {CalibrationScoringConfiguration}
   */
  static fromCalibration({ calibration }) {
    return new CalibrationScoringConfiguration({
      calibrationId: calibration.id,
      globalScoringConfiguration: calibration.scoringMeshes.map(_toMeshLevelBounds),
    });
  }
}

/**
 * @param {CalibrationScoringMesh} calibrationScoringMesh
 */
function _toMeshLevelBounds({ mesh, minBoundCuratedValue, maxBoundCuratedValue }) {
  return {
    meshLevel: mesh,
    bounds: {
      min: minBoundCuratedValue,
      max: maxBoundCuratedValue,
    },
  };
}
