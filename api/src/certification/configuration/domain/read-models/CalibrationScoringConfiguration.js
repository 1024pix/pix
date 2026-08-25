/**
 * @typedef {import('../models/Calibration.js').Calibration} Calibration
 * @typedef {import('../models/Calibration.js').CalibrationScoringMesh} CalibrationScoringMesh
 */

/**
 * The global scoring configuration a draft version could adopt, as proposed by a calibration.
 *
 * It is NOT an attribute of the version: it lives in the datamart, Data delivers it after the
 * calibration itself and sometimes never delivers it at all. Nothing is persisted here, the
 * configuration is only committed to the version when a super admin submits the scoring form.
 */
export class CalibrationScoringConfiguration {
  /**
   * @param {object} params
   * @param {number} params.calibrationId
   * @param {Array<{meshLevel: number, bounds: {min: number, max: number}}>} params.globalScoringConfiguration - empty when the calibration carries no validated mesh
   */
  constructor({ calibrationId, globalScoringConfiguration }) {
    this.calibrationId = calibrationId;
    this.globalScoringConfiguration = globalScoringConfiguration;
  }

  /**
   * Translates the datamart vocabulary (mesh, curated bounds) into the one the API configuration
   * speaks (mesh level, bounds).
   *
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
