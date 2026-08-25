/**
 * @typedef {import('../models/Calibration.js').Calibration} Calibration
 * @typedef {import('../models/Calibration.js').CalibrationScoringMesh} CalibrationScoringMesh
 */

import { SCORING_MESH_AVAILABILITIES } from '../models/Calibration.js';

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
   * @param {typeof SCORING_MESH_AVAILABILITIES[keyof typeof SCORING_MESH_AVAILABILITIES]} params.availability
   * @param {Array<{meshLevel: number, bounds: {min: number, max: number}}>} params.globalScoringConfiguration - empty unless available
   */
  constructor({ calibrationId, availability, globalScoringConfiguration }) {
    this.calibrationId = calibrationId;
    this.availability = availability;
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
    const { scoringMeshSet } = calibration;

    return new CalibrationScoringConfiguration({
      calibrationId: calibration.id,
      availability: scoringMeshSet.availability,
      globalScoringConfiguration: scoringMeshSet.isAvailable ? scoringMeshSet.meshes.map(_toMeshLevelBounds) : [],
    });
  }

  get isAvailable() {
    return this.availability === SCORING_MESH_AVAILABILITIES.AVAILABLE;
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
